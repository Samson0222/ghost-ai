import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function n(
  id: string,
  label: string,
  shape: CanvasNode["data"]["shape"],
  colorIndex: number,
  x: number,
  y: number,
  w: number,
  h: number
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, color: NODE_COLORS[colorIndex].fill, shape },
    width: w,
    height: h,
  };
}

function e(id: string, source: string, target: string, label?: string): CanvasEdge {
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    data: label ? { label } : {},
  };
}

// Microservices: API gateway → auth / user / order services → dedicated DBs
const microservices: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description:
    "API gateway routing requests to independent backend services with dedicated databases.",
  nodes: [
    n("ms-client",      "Client",        "rectangle", 1, 0,   100, 120, 50),
    n("ms-gateway",     "API Gateway",   "rectangle", 3, 200, 100, 140, 50),
    n("ms-auth",        "Auth Service",  "rectangle", 2, 420, 0,   130, 50),
    n("ms-users",       "User Service",  "rectangle", 6, 420, 100, 130, 50),
    n("ms-orders",      "Order Service", "rectangle", 4, 420, 200, 130, 50),
    n("ms-db-auth",     "Auth DB",       "cylinder",  0, 630, 0,   100, 50),
    n("ms-db-users",    "User DB",       "cylinder",  0, 630, 100, 100, 50),
    n("ms-db-orders",   "Order DB",      "cylinder",  0, 630, 200, 100, 50),
  ],
  edges: [
    e("e-c-gw",      "ms-client",  "ms-gateway"),
    e("e-gw-auth",   "ms-gateway", "ms-auth"),
    e("e-gw-users",  "ms-gateway", "ms-users"),
    e("e-gw-orders", "ms-gateway", "ms-orders"),
    e("e-auth-db",   "ms-auth",    "ms-db-auth"),
    e("e-users-db",  "ms-users",   "ms-db-users"),
    e("e-orders-db", "ms-orders",  "ms-db-orders"),
  ],
};

// CI/CD: commit → build → test → artifact store → staging → production
const cicd: CanvasTemplate = {
  id: "cicd",
  name: "CI/CD Pipeline",
  description:
    "Automated pipeline from code commit through build, test, and staged deployment to production.",
  nodes: [
    n("ci-commit",   "Commit",         "rectangle", 1, 0,   0,   110, 50),
    n("ci-build",    "Build",          "rectangle", 3, 160, 0,   100, 50),
    n("ci-test",     "Test",           "rectangle", 6, 310, 0,   100, 50),
    n("ci-artifact", "Artifact Store", "cylinder",  0, 460, 0,   120, 50),
    n("ci-staging",  "Staging",        "rectangle", 2, 310, 130, 120, 50),
    n("ci-prod",     "Production",     "pill",      7, 460, 130, 120, 50),
  ],
  edges: [
    e("e-commit-build",    "ci-commit",   "ci-build"),
    e("e-build-test",      "ci-build",    "ci-test"),
    e("e-test-artifact",   "ci-test",     "ci-artifact"),
    e("e-artifact-staging","ci-artifact", "ci-staging"),
    e("e-staging-prod",    "ci-staging",  "ci-prod"),
  ],
};

// Event-driven: producers → event bus → consumers + dead-letter queue
const eventDriven: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description:
    "Event producers publish messages to a central bus consumed by independent downstream services.",
  nodes: [
    n("ev-orders",    "Order Service", "rectangle", 1, 0,   80,  130, 50),
    n("ev-users",     "User Service",  "rectangle", 1, 0,   200, 130, 50),
    n("ev-bus",       "Event Bus",     "rectangle", 3, 220, 120, 130, 60),
    n("ev-analytics", "Analytics",     "rectangle", 6, 440, 60,  120, 50),
    n("ev-notify",    "Notifications", "rectangle", 6, 440, 160, 120, 50),
    n("ev-audit",     "Audit Log",     "rectangle", 6, 440, 260, 120, 50),
    n("ev-dlq",       "Dead Letter Q", "cylinder",  4, 220, 290, 130, 50),
  ],
  edges: [
    e("e-orders-bus",    "ev-orders",    "ev-bus"),
    e("e-users-bus",     "ev-users",     "ev-bus"),
    e("e-bus-analytics", "ev-bus",       "ev-analytics"),
    e("e-bus-notify",    "ev-bus",       "ev-notify"),
    e("e-bus-audit",     "ev-bus",       "ev-audit"),
    e("e-bus-dlq",       "ev-bus",       "ev-dlq", "on failure"),
  ],
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [microservices, cicd, eventDriven];
