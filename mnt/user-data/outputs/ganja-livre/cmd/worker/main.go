package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"go.uber.org/zap"

	"github.com/ganja_livre/api/internal/config"
	"github.com/ganja_livre/api/internal/mongodb"
	"github.com/ganja_livre/api/internal/temporal/activities"
	"github.com/ganja_livre/api/internal/temporal/workflows"
)

func main() {
	if os.Getenv("APP_ENV") != "production" {
		_ = godotenv.Load()
	}

	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "config error: %v\n", err)
		os.Exit(1)
	}

	log, _ := zap.NewProduction()
	defer log.Sync() //nolint:errcheck

	// ── MongoDB ──────────────────────────────────────────────────────────────
	mongoClient, err := mongodb.New(cfg.MongoDB, log)
	if err != nil {
		log.Fatal("mongodb connection failed", zap.Error(err))
	}
	cols := mongoClient.Collections()

	// ── Temporal ─────────────────────────────────────────────────────────────
	tc, err := client.Dial(client.Options{
		HostPort:  cfg.Temporal.HostPort,
		Namespace: cfg.Temporal.Namespace,
	})
	if err != nil {
		log.Fatal("temporal connection failed", zap.Error(err))
	}
	defer tc.Close()

	// ── Worker ───────────────────────────────────────────────────────────────
	w := worker.New(tc, cfg.Temporal.TaskQueue, worker.Options{
		MaxConcurrentActivityExecutionSize:     10,
		MaxConcurrentWorkflowTaskExecutionSize: 10,
	})

	// Register workflows
	w.RegisterWorkflow(workflows.OrderWorkflow)

	// Register activities (with injected DB dependencies)
	acts := activities.New(cols.Orders, cols.Products, log)
	w.RegisterActivity(acts.ReserveStock)
	w.RegisterActivity(acts.ReleaseStock)
	w.RegisterActivity(acts.UpdateOrderStatus)
	w.RegisterActivity(acts.RecordPaymentIntent)
	w.RegisterActivity(acts.NotifySeller)
	w.RegisterActivity(acts.ShipOrder)

	log.Info("Temporal worker starting", zap.String("taskQueue", cfg.Temporal.TaskQueue))

	if err = w.Run(worker.InterruptCh()); err != nil {
		log.Fatal("worker failed", zap.Error(err))
	}
}
