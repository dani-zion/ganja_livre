import { useState } from "react";

const theme = {
  bg: "#0a0f0d",
  surface: "#111a14",
  border: "#1e3326",
  accent: "#2d6a4f",
  green: "#52b788",
  greenBright: "#74c69d",
  greenDim: "#1b4332",
  yellow: "#d4a017",
  red: "#e05252",
  blue: "#52a8b7",
  text: "#d8f3dc",
  textDim: "#6a9b7e",
  textMuted: "#3a5c45",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: ${theme.bg}; }

  .diagram-root {
    background: ${theme.bg};
    min-height: 100vh;
    font-family: 'Syne', sans-serif;
    color: ${theme.text};
    padding: 32px 24px 64px;
    position: relative;
    overflow: hidden;
  }

  .noise {
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0;
  }

  .content { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }

  .header { text-align: center; margin-bottom: 48px; }
  .header-eyebrow {
    font-family: 'Space Mono', monospace;
    font-size: 11px; letter-spacing: 4px;
    color: ${theme.green}; text-transform: uppercase;
    margin-bottom: 12px;
  }
  .header-title {
    font-size: 42px; font-weight: 800; line-height: 1;
    background: linear-gradient(135deg, ${theme.greenBright}, ${theme.green}, #a7f3d0);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
  .header-sub {
    color: ${theme.textDim}; font-size: 14px; font-weight: 400;
  }

  /* ── Legend ── */
  .legend {
    display: flex; gap: 20px; justify-content: center;
    flex-wrap: wrap; margin-bottom: 40px;
  }
  .legend-item {
    display: flex; align-items: center; gap: 8px;
    font-family: 'Space Mono', monospace; font-size: 11px;
    color: ${theme.textDim};
  }
  .legend-dot { width: 10px; height: 10px; border-radius: 2px; }

  /* ── Layer ── */
  .layer {
    margin-bottom: 12px; position: relative;
  }
  .layer-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px; letter-spacing: 3px;
    color: ${theme.textMuted}; text-transform: uppercase;
    margin-bottom: 8px; padding-left: 4px;
  }
  .layer-row {
    display: flex; gap: 10px; align-items: stretch;
    flex-wrap: wrap;
  }

  /* ── Node ── */
  .node {
    border-radius: 10px; padding: 16px 18px;
    cursor: pointer; transition: all 0.2s ease;
    position: relative; overflow: hidden;
    border: 1px solid transparent;
    flex: 1; min-width: 160px;
  }
  .node:hover { transform: translateY(-2px); }
  .node::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.04), transparent);
    pointer-events: none;
  }
  .node.active { border-color: ${theme.green} !important; }

  .node-icon { font-size: 20px; margin-bottom: 8px; }
  .node-title {
    font-size: 13px; font-weight: 700; margin-bottom: 4px;
    letter-spacing: 0.3px;
  }
  .node-sub {
    font-family: 'Space Mono', monospace;
    font-size: 10px; color: ${theme.textDim};
    line-height: 1.4;
  }
  .node-tag {
    display: inline-block; margin-top: 8px;
    padding: 2px 8px; border-radius: 4px;
    font-family: 'Space Mono', monospace;
    font-size: 9px; letter-spacing: 1px; text-transform: uppercase;
  }

  /* Color variants */
  .node-green {
    background: linear-gradient(135deg, #0d2018, #0a1a12);
    border-color: ${theme.greenDim};
    color: ${theme.greenBright};
  }
  .node-green .node-sub { color: #4a8a6a; }

  .node-blue {
    background: linear-gradient(135deg, #0d1e22, #091518);
    border-color: #1a3a42;
    color: #7dd3e8;
  }
  .node-blue .node-sub { color: #3a7080; }

  .node-yellow {
    background: linear-gradient(135deg, #1e1a08, #141205);
    border-color: #3a3010;
    color: #e8c847;
  }
  .node-yellow .node-sub { color: #7a6820; }

  .node-red {
    background: linear-gradient(135deg, #1e0d0d, #140909);
    border-color: #3a1818;
    color: #f08080;
  }
  .node-red .node-sub { color: #7a3838; }

  .node-purple {
    background: linear-gradient(135deg, #130e1e, #0d0a14);
    border-color: #281e3a;
    color: #b48ff0;
  }
  .node-purple .node-sub { color: #5a4880; }

  /* ── Connector arrows ── */
  .connectors {
    display: flex; justify-content: center;
    align-items: center; height: 36px; gap: 4px;
    position: relative;
  }
  .arrow-col {
    display: flex; flex-direction: column;
    align-items: center; gap: 2px;
  }
  .arrow-line {
    width: 1px; height: 16px;
    background: linear-gradient(to bottom, ${theme.greenDim}, ${theme.accent});
  }
  .arrow-head {
    width: 0; height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 7px solid ${theme.accent};
  }
  .arrow-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px; color: ${theme.textMuted};
    letter-spacing: 1px; white-space: nowrap;
  }
  .arrow-row {
    display: flex; align-items: center; gap: 8px;
    justify-content: center; height: 28px;
  }
  .arrow-h-line {
    height: 1px; width: 60px;
    background: linear-gradient(to right, ${theme.accent}, ${theme.greenDim});
  }
  .arrow-h-head {
    width: 0; height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 7px solid ${theme.accent};
  }

  /* ── Workflow section ── */
  .workflow-section {
    margin-top: 40px;
    background: linear-gradient(135deg, #0d1a10, #090f0b);
    border: 1px solid ${theme.greenDim};
    border-radius: 14px; padding: 24px;
  }
  .workflow-title {
    font-family: 'Space Mono', monospace;
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
    color: ${theme.textMuted}; margin-bottom: 20px;
  }
  .workflow-steps {
    display: flex; align-items: center;
    gap: 0; overflow-x: auto; padding-bottom: 8px;
    scrollbar-width: thin; scrollbar-color: ${theme.greenDim} transparent;
  }
  .workflow-step {
    flex-shrink: 0; text-align: center;
    padding: 12px 14px; border-radius: 8px;
    min-width: 110px; cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
  }
  .workflow-step:hover { border-color: ${theme.green}; transform: translateY(-2px); }
  .workflow-step.active-step {
    border-color: ${theme.green} !important;
    background: ${theme.greenDim};
  }
  .step-status {
    font-family: 'Space Mono', monospace;
    font-size: 9px; letter-spacing: 1px;
    padding: 3px 8px; border-radius: 4px;
    display: inline-block; margin-bottom: 6px;
  }
  .step-desc {
    font-size: 10px; color: ${theme.textDim};
    line-height: 1.4;
  }
  .step-arrow {
    font-size: 16px; color: ${theme.textMuted};
    padding: 0 4px; flex-shrink: 0;
  }
  .step-signal {
    font-family: 'Space Mono', monospace;
    font-size: 8px; color: ${theme.yellow};
    margin-top: 4px;
  }

  /* ── Detail panel ── */
  .detail-panel {
    margin-top: 20px;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: 10px; padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  .detail-title {
    font-size: 16px; font-weight: 700;
    color: ${theme.greenBright}; margin-bottom: 8px;
  }
  .detail-desc {
    font-size: 13px; color: ${theme.textDim}; line-height: 1.6;
    margin-bottom: 12px;
  }
  .detail-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .detail-tag {
    font-family: 'Space Mono', monospace;
    font-size: 10px; padding: 3px 10px;
    border-radius: 4px; letter-spacing: 1px;
  }

  /* ── Security strip ── */
  .security-strip {
    margin-top: 16px; display: flex; gap: 8px;
    flex-wrap: wrap; justify-content: center;
  }
  .sec-badge {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 6px;
    background: #0d1f14; border: 1px solid #1a3822;
    font-family: 'Space Mono', monospace;
    font-size: 10px; color: ${theme.green};
    letter-spacing: 0.5px;
  }
`;

const nodes = {
  client: {
    id: "client", icon: "📱", title: "Client / Mobile",
    sub: "HTTP · Bearer token", tag: "HTTPS :443", tagColor: "#0d2a1e", tagText: "#52b788",
    color: "node-green",
    detail: "External consumers of the API. All communication happens over HTTPS. The client includes a Bearer JWT in every authenticated request via the Authorization header.",
    tags: ["HTTPS only", "Bearer JWT", "GraphQL POST /query"],
  },
  api: {
    id: "api", icon: "⚙️", title: "API Server",
    sub: "Go 1.22 · Chi · gqlgen", tag: ":8080", tagColor: "#0d2a1e", tagText: "#52b788",
    color: "node-green",
    detail: "The core Go HTTP server. Chi router handles request routing and middleware chaining. gqlgen generates type-safe GraphQL boilerplate from the schema. Graceful shutdown on SIGTERM.",
    tags: ["Go 1.22", "Chi router", "gqlgen", "Graceful shutdown", "FROM scratch image"],
  },
  jwt: {
    id: "jwt", icon: "🔐", title: "JWT Middleware",
    sub: "golang-jwt/jwt v5\nAccess: 15min · Refresh: 7d",
    tag: "RBAC", tagColor: "#1a1408", tagText: "#d4a017",
    color: "node-yellow",
    detail: "Validates Bearer tokens on every request. Injects claims (userID, email, role) into the request context. Separate secrets for access and refresh tokens. RBAC enforced at resolver level — not just middleware.",
    tags: ["HS256", "Separate secrets", "RBAC: CUSTOMER/SELLER/ADMIN", "Timing-safe login"],
  },
  graphql: {
    id: "graphql", icon: "🕸️", title: "GraphQL Layer",
    sub: "Resolvers: auth · products · orders\nComplexity limit: 100",
    tag: "gqlgen", tagColor: "#0d1e22", tagText: "#52a8b7",
    color: "node-blue",
    detail: "Three resolver groups: Auth (register, login, refresh), Products (CRUD, paginated search, full-text), Orders (place, cancel, status). Introspection disabled in production. Query complexity capped at 100 to prevent DoS.",
    tags: ["Auth resolvers", "Product resolvers", "Order resolvers", "No introspection in prod", "Complexity limit"],
  },
  mongodb: {
    id: "mongodb", icon: "🍃", title: "MongoDB 7.0",
    sub: "Collections: users · products · orders\nTransactions · Schema validation",
    tag: "PRIMARY", tagColor: "#0d2a1e", tagText: "#52b788",
    color: "node-green",
    detail: "Three collections with enforced JSON Schema validation at the DB level. Indexes for queries, full-text search, and unique constraints. Transactions used for atomic stock operations. App user has readWrite only — no cluster admin.",
    tags: ["Schema validators", "Compound indexes", "Full-text search", "MongoDB transactions", "Least-privilege user"],
  },
  temporal: {
    id: "temporal", icon: "⏱️", title: "Temporal Server",
    sub: "Namespace: default\nDurable workflow orchestration",
    tag: ":7233", tagColor: "#130e1e", tagText: "#b48ff0",
    color: "node-purple",
    detail: "Hosts and schedules all workflow executions. Stores event history for durability and replay. Backed by PostgreSQL. Each order gets a unique workflow ID as idempotency key.",
    tags: ["PostgreSQL backend", "Durable history", "Idempotent workflows", "Signal-driven"],
  },
  worker: {
    id: "worker", icon: "🔧", title: "Temporal Worker",
    sub: "Go 1.22 · Separate pod\nActivities: stock · payment · ship",
    tag: "WORKER", tagColor: "#130e1e", tagText: "#b48ff0",
    color: "node-purple",
    detail: "Polls Temporal for tasks and executes workflow code and activities. Runs as a separate container — can be scaled independently from the API. Injects MongoDB collections for all DB operations.",
    tags: ["Separate container", "Horizontal scale", "Retry + backoff", "MongoDB transactions"],
  },
  ratelimit: {
    id: "ratelimit", icon: "🛡️", title: "Rate Limiter",
    sub: "Per-IP token bucket\nRetry-After header",
    tag: "SECURITY", tagColor: "#1e0d0d", tagText: "#f08080",
    color: "node-red",
    detail: "Per-IP token bucket rate limiter. Returns 429 with a Retry-After header. Designed to be swapped for a Redis-backed distributed limiter (go-redis/redis_rate) in multi-instance production deployments.",
    tags: ["Token bucket", "429 Too Many Requests", "Redis-ready pattern"],
  },
};

const workflowSteps = [
  { status: "PENDING", color: "#2d6a4f", bg: "#0d2018", desc: "Order created, workflow starts", signal: null },
  { status: "PAYMENT_PROCESSING", color: "#d4a017", bg: "#1e1a08", desc: "Stock reserved via Mongo TX", signal: "await signal" },
  { status: "PAYMENT_CONFIRMED", color: "#52a8b7", bg: "#0d1e22", desc: "Payment signal received", signal: "payment-confirmed" },
  { status: "PREPARING", color: "#b48ff0", bg: "#130e1e", desc: "Seller notified", signal: null },
  { status: "SHIPPED", color: "#52b788", bg: "#0d2018", desc: "Carrier integration", signal: null },
  { status: "DELIVERED", color: "#74c69d", bg: "#0d2018", desc: "Auto-confirm after 15d", signal: "delivery-confirmed" },
  { status: "CANCELLED", color: "#e05252", bg: "#1e0d0d", desc: "Stock released", signal: "order-cancelled" },
];

const securityBadges = [
  "🔒 bcrypt passwords",
  "🎟️ JWT dual-secret",
  "🧱 FROM scratch image",
  "📋 Schema validators",
  "⚡ Complexity limit",
  "🌐 Security headers",
  "🚦 Rate limiting",
  "🔑 Least-privilege DB",
];

export default function ArchDiagram() {
  const [selected, setSelected] = useState(null);
  const [activeStep, setActiveStep] = useState(null);

  const sel = (id) => setSelected(selected === id ? null : id);
  const selectedNode = selected ? nodes[selected] : null;

  return (
    <>
      <style>{styles}</style>
      <div className="diagram-root">
        <div className="noise" />
        <div className="content">

          {/* Header */}
          <div className="header">
            <div className="header-eyebrow">System Architecture</div>
            <div className="header-title">Ganja Livre API</div>
            <div className="header-sub">Go · GraphQL · MongoDB · Temporal.io — click any node to explore</div>
          </div>

          {/* Legend */}
          <div className="legend">
            {[
              { color: "#1b4332", label: "Go services" },
              { color: "#1a3a42", label: "GraphQL" },
              { color: "#3a3010", label: "Security" },
              { color: "#281e3a", label: "Temporal" },
              { color: "#3a1818", label: "Guards" },
            ].map(l => (
              <div className="legend-item" key={l.label}>
                <div className="legend-dot" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* ── Layer: Client ── */}
          <div className="layer">
            <div className="layer-label">External</div>
            <div className="layer-row" style={{ justifyContent: "center" }}>
              <div
                className={`node node-green ${selected === "client" ? "active" : ""}`}
                style={{ maxWidth: 280 }}
                onClick={() => sel("client")}
              >
                <div className="node-icon">{nodes.client.icon}</div>
                <div className="node-title">{nodes.client.title}</div>
                <div className="node-sub">{nodes.client.sub}</div>
                <div className="node-tag" style={{ background: nodes.client.tagColor, color: nodes.client.tagText }}>
                  {nodes.client.tag}
                </div>
              </div>
            </div>
          </div>

          {/* Arrow down */}
          <div className="connectors">
            <div className="arrow-col">
              <div className="arrow-label">HTTPS · POST /query</div>
              <div className="arrow-line" />
              <div className="arrow-head" />
            </div>
          </div>

          {/* ── Layer: Middleware ── */}
          <div className="layer">
            <div className="layer-label">Ingress &amp; Security</div>
            <div className="layer-row">
              {["ratelimit", "api", "jwt"].map(id => {
                const n = nodes[id];
                return (
                  <div
                    key={id}
                    className={`node ${n.color} ${selected === id ? "active" : ""}`}
                    onClick={() => sel(id)}
                  >
                    <div className="node-icon">{n.icon}</div>
                    <div className="node-title">{n.title}</div>
                    <div className="node-sub">{n.sub}</div>
                    <div className="node-tag" style={{ background: n.tagColor, color: n.tagText }}>
                      {n.tag}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow */}
          <div className="connectors">
            <div className="arrow-col">
              <div className="arrow-label">Validated · Authenticated</div>
              <div className="arrow-line" />
              <div className="arrow-head" />
            </div>
          </div>

          {/* ── Layer: GraphQL ── */}
          <div className="layer">
            <div className="layer-label">Application</div>
            <div className="layer-row" style={{ justifyContent: "center" }}>
              <div
                className={`node node-blue ${selected === "graphql" ? "active" : ""}`}
                style={{ maxWidth: 440 }}
                onClick={() => sel("graphql")}
              >
                <div className="node-icon">{nodes.graphql.icon}</div>
                <div className="node-title">{nodes.graphql.title}</div>
                <div className="node-sub">{nodes.graphql.sub}</div>
                <div className="node-tag" style={{ background: nodes.graphql.tagColor, color: nodes.graphql.tagText }}>
                  {nodes.graphql.tag}
                </div>
              </div>
            </div>
          </div>

          {/* Arrows branching left and right */}
          <div className="connectors" style={{ justifyContent: "space-around" }}>
            <div className="arrow-col">
              <div className="arrow-label">reads / writes</div>
              <div className="arrow-line" />
              <div className="arrow-head" />
            </div>
            <div className="arrow-col">
              <div className="arrow-label">start workflow</div>
              <div className="arrow-line" />
              <div className="arrow-head" />
            </div>
          </div>

          {/* ── Layer: Data + Temporal ── */}
          <div className="layer">
            <div className="layer-label">Persistence &amp; Orchestration</div>
            <div className="layer-row">
              {["mongodb", "temporal", "worker"].map(id => {
                const n = nodes[id];
                return (
                  <div
                    key={id}
                    className={`node ${n.color} ${selected === id ? "active" : ""}`}
                    onClick={() => sel(id)}
                  >
                    <div className="node-icon">{n.icon}</div>
                    <div className="node-title">{n.title}</div>
                    <div className="node-sub">{n.sub}</div>
                    <div className="node-tag" style={{ background: n.tagColor, color: n.tagText }}>
                      {n.tag}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          {selectedNode && (
            <div className="detail-panel">
              <div className="detail-title">{selectedNode.icon} {selectedNode.title}</div>
              <div className="detail-desc">{selectedNode.detail}</div>
              <div className="detail-tags">
                {selectedNode.tags.map(t => (
                  <span
                    key={t}
                    className="detail-tag"
                    style={{ background: "#0d1a10", border: "1px solid #1e3326", color: theme.greenBright }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Order Workflow ── */}
          <div className="workflow-section">
            <div className="workflow-title">⏱ Temporal Order Workflow — click a stage</div>
            <div className="workflow-steps">
              {workflowSteps.map((step, i) => (
                <>
                  <div
                    key={step.status}
                    className={`workflow-step ${activeStep === i ? "active-step" : ""}`}
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                  >
                    <div
                      className="step-status"
                      style={{ background: step.bg, color: step.color, border: `1px solid ${step.color}44` }}
                    >
                      {step.status}
                    </div>
                    <div className="step-desc">{step.desc}</div>
                    {step.signal && (
                      <div className="step-signal">⚡ {step.signal}</div>
                    )}
                  </div>
                  {i < workflowSteps.length - 1 && (
                    <div className="step-arrow" key={`arrow-${i}`}>›</div>
                  )}
                </>
              ))}
            </div>

            {activeStep !== null && (
              <div style={{
                marginTop: 16, padding: "12px 16px",
                background: "#090f0b", borderRadius: 8,
                border: `1px solid ${workflowSteps[activeStep].color}44`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 11, color: workflowSteps[activeStep].color,
                lineHeight: 1.6,
                animation: "fadeIn 0.2s ease",
              }}>
                <strong>Stage:</strong> {workflowSteps[activeStep].status}<br />
                <strong>Action:</strong> {workflowSteps[activeStep].desc}
                {workflowSteps[activeStep].signal && (
                  <><br /><strong>Signal:</strong> <span style={{ color: theme.yellow }}>"{workflowSteps[activeStep].signal}"</span> — workflow awaits this external signal</>
                )}
                {workflowSteps[activeStep].status === "PAYMENT_PROCESSING" && (
                  <><br /><strong>Timeout:</strong> <span style={{ color: theme.red }}>30 minutes</span> — auto-cancels and releases stock if no payment signal arrives</>
                )}
                {workflowSteps[activeStep].status === "DELIVERED" && (
                  <><br /><strong>Auto-confirm:</strong> <span style={{ color: theme.green }}>15 days</span> — if no dispute signal, order is marked delivered automatically</>
                )}
              </div>
            )}
          </div>

          {/* ── Security strip ── */}
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              letterSpacing: 3, color: theme.textMuted,
              textTransform: "uppercase", marginBottom: 12,
            }}>
              Security Properties
            </div>
            <div className="security-strip">
              {securityBadges.map(b => (
                <div className="sec-badge" key={b}>{b}</div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 40, textAlign: "center",
            fontFamily: "'Space Mono', monospace",
            fontSize: 10, color: theme.textMuted, letterSpacing: 2,
          }}>
            GANJA LIVRE · GO 1.22 · GRAPHQL · MONGODB 7.0 · TEMPORAL 1.26
          </div>

        </div>
      </div>
    </>
  );
}
