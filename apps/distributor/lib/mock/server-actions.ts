import "server-only";

import { createMockSession, createMockProfile, mockHandlers } from "./index";
import type { MockContext } from "./index";

const SHOULD_USE_MOCK = process.env.API_USE_MOCK === "true";

export async function fetchMockDashboard(
  role: "sales" | "distributor",
  ctx?: MockContext,
) {
  if (role === "sales") {
    return mockHandlers.salesDashboard(ctx);
  }
  return mockHandlers.distributorDashboard(ctx);
}

export async function fetchMockOrders(
  type: "sales" | "distributor",
  ctx?: MockContext,
) {
  if (type === "sales") {
    return mockHandlers.salesOrders(ctx);
  }
  return mockHandlers.distributorOrders(ctx);
}

export async function fetchMockCustomers(ctx?: MockContext) {
  return mockHandlers.customers(ctx);
}

export async function fetchMockTasks(ctx?: MockContext) {
  return mockHandlers.tasks(ctx);
}

export async function fetchMockSession(
  role: "sales" | "distributor" = "sales",
) {
  const session = createMockSession(role);
  const profile = createMockProfile(role);

  return { session, profile };
}

export function useMock() {
  return SHOULD_USE_MOCK;
}
