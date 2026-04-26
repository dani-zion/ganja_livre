package activities

import (
	"context"
	"fmt"
	"time"

	"github.com/ganjaLivre/api/internal/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.temporal.io/sdk/activity"
	"go.uber.org/zap"
)

// OrderItemInput mirrors the workflow type to avoid circular imports.
type OrderItemInput struct {
	ProductID string
	Quantity  int
}

// Activities holds the dependencies injected at worker startup.
type Activities struct {
	orders   *mongo.Collection
	products *mongo.Collection
	log      *zap.Logger
}

func New(orders, products *mongo.Collection, log *zap.Logger) *Activities {
	return &Activities{orders: orders, products: products, log: log}
}

// ── ReserveStock atomically decrements stock using MongoDB transactions. ──────

func (a *Activities) ReserveStock(ctx context.Context, orderID string, items []OrderItemInput) error {
	log := activity.GetLogger(ctx)

	session, err := a.products.Database().Client().StartSession()
	if err != nil {
		return fmt.Errorf("start session: %w", err)
	}
	defer session.EndSession(ctx)

	_, err = session.WithTransaction(ctx, func(sc mongo.SessionContext) (interface{}, error) {
		for _, item := range items {
			pid, err := primitive.ObjectIDFromHex(item.ProductID)
			if err != nil {
				return nil, fmt.Errorf("invalid product id %s: %w", item.ProductID, err)
			}

			res, err := a.products.UpdateOne(sc,
				bson.M{
					"_id":       pid,
					"is_active": true,
					"stock":     bson.M{"$gte": item.Quantity},
				},
				bson.M{
					"$inc": bson.M{"stock": -item.Quantity},
					"$set": bson.M{"updated_at": time.Now().UTC()},
				},
			)
			if err != nil {
				return nil, fmt.Errorf("reserve stock for %s: %w", item.ProductID, err)
			}
			if res.MatchedCount == 0 {
				return nil, fmt.Errorf("insufficient stock or inactive product: %s", item.ProductID)
			}
		}
		return nil, nil
	})

	if err != nil {
		log.Error("ReserveStock failed", "orderID", orderID, "error", err)
		return err
	}

	log.Info("stock reserved", "orderID", orderID)
	return nil
}

// ── ReleaseStock restores stock when an order is cancelled. ──────────────────

func (a *Activities) ReleaseStock(ctx context.Context, orderID string, items []OrderItemInput) error {
	session, err := a.products.Database().Client().StartSession()
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	_, err = session.WithTransaction(ctx, func(sc mongo.SessionContext) (interface{}, error) {
		for _, item := range items {
			pid, _ := primitive.ObjectIDFromHex(item.ProductID)
			_, err := a.products.UpdateOne(sc,
				bson.M{"_id": pid},
				bson.M{
					"$inc": bson.M{"stock": item.Quantity},
					"$set": bson.M{"updated_at": time.Now().UTC()},
				},
			)
			if err != nil {
				return nil, err
			}
		}
		return nil, nil
	})
	return err
}

// ── UpdateOrderStatus persists a status transition to MongoDB. ────────────────

func (a *Activities) UpdateOrderStatus(ctx context.Context, orderID string, status model.OrderStatus) error {
	oid, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		return err
	}
	_, err = a.orders.UpdateOne(ctx,
		bson.M{"_id": oid},
		bson.M{"$set": bson.M{
			"status":     status,
			"updated_at": time.Now().UTC(),
		}},
		options.Update().SetUpsert(false),
	)
	return err
}

// ── RecordPaymentIntent stores the external payment reference. ────────────────

func (a *Activities) RecordPaymentIntent(ctx context.Context, orderID, paymentIntentID string) error {
	oid, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		return err
	}
	_, err = a.orders.UpdateOne(ctx,
		bson.M{"_id": oid},
		bson.M{"$set": bson.M{
			"payment_intent_id": paymentIntentID,
			"updated_at":        time.Now().UTC(),
		}},
	)
	return err
}

// ── NotifySeller sends an internal notification to the seller. ────────────────
// This is a stub — replace with email/push/SMS integration.

func (a *Activities) NotifySeller(ctx context.Context, orderID string) error {
	log := activity.GetLogger(ctx)
	log.Info("notifying seller (stub)", "orderID", orderID)
	// TODO: integrate with notification service (SES, FCM, etc.)
	return nil
}

// ── ShipOrder triggers shipping integration. ──────────────────────────────────
// Stub — replace with carrier API (Correios, Jadlog, etc.)

func (a *Activities) ShipOrder(ctx context.Context, orderID string) error {
	log := activity.GetLogger(ctx)
	log.Info("shipping order (stub)", "orderID", orderID)
	// TODO: integrate with shipping provider
	return nil
}
