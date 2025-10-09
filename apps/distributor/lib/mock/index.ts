import type { Session, UserProfile } from "@shiba/models";

import { distributorDashboardMock } from "./distributor-dashboard";
import { customersMock } from "./customers";
import { salesOrdersMock, distributorOrdersMock } from "./orders";
import { salesDashboardMock } from "./sales-dashboard";
import { tasksMock } from "./tasks";

export interface MockContext {
  latency?: number;
}

const DEFAULT_LATENCY = 300;

function withLatency<T>(value: T, latency = DEFAULT_LATENCY) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), latency);
  });
}

export function createMockSession(role: Session["role"] = "sales"): Session {
  return {
    id: "mock-session",
    role,
    permissions: ["dashboard:read"],
  };
}

export function createMockProfile(
  role: UserProfile["role"] = "sales",
): UserProfile {
  return {
    id: "mock-user",
    name: role === "sales" ? "王晓" : "佐藤太郎",
    role,
  };
}

export const mockHandlers = {
  salesDashboard: (ctx?: MockContext) =>
    withLatency(salesDashboardMock, ctx?.latency),
  distributorDashboard: (ctx?: MockContext) =>
    withLatency(distributorDashboardMock, ctx?.latency),
  salesOrders: (ctx?: MockContext) =>
    withLatency(salesOrdersMock, ctx?.latency),
  distributorOrders: (ctx?: MockContext) =>
    withLatency(distributorOrdersMock, ctx?.latency),
  customers: (ctx?: MockContext) => withLatency(customersMock, ctx?.latency),
  tasks: (ctx?: MockContext) => withLatency(tasksMock, ctx?.latency),
};
