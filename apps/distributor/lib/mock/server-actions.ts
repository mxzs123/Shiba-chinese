import "server-only";

import type { Task, TaskStatus } from "@shiba/models";

import { createMockSession, createMockProfile, mockHandlers } from "./index";
import type { MockContext } from "./index";
import {
  createCustomerFollowUp,
  deleteCustomerFollowUp,
  findCustomerById,
  listCustomers,
  updateCustomerFollowUp,
} from "./customers";
import { findTaskById, updateTaskStatus } from "./tasks";

const API_USE_MOCK = process.env.API_USE_MOCK;

const SHOULD_USE_MOCK =
  API_USE_MOCK === "true" ||
  (API_USE_MOCK !== "false" && process.env.NODE_ENV !== "production");

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

export async function fetchMockCustomerById(id: string) {
  return findCustomerById(id);
}

export async function fetchMockCustomerList() {
  return listCustomers();
}

export async function createMockCustomerFollowUp(
  customerId: string,
  input: Parameters<typeof createCustomerFollowUp>[1],
) {
  return createCustomerFollowUp(customerId, input);
}

export async function updateMockCustomerFollowUp(
  customerId: string,
  followUpId: string,
  input: Parameters<typeof updateCustomerFollowUp>[2],
) {
  return updateCustomerFollowUp(customerId, followUpId, input);
}

export async function deleteMockCustomerFollowUp(
  customerId: string,
  followUpId: string,
) {
  return deleteCustomerFollowUp(customerId, followUpId);
}

export async function fetchMockTasks(ctx?: MockContext): Promise<Task[]> {
  return mockHandlers.tasks(ctx);
}

export async function updateMockTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<Task | undefined> {
  return updateTaskStatus(taskId, status);
}

export async function fetchMockTask(taskId: string): Promise<Task | undefined> {
  return findTaskById(taskId);
}

export async function fetchMockSession(
  role: "sales" | "distributor" = "sales",
) {
  const session = createMockSession(role);
  const profile = createMockProfile(role);

  return { session, profile };
}

export async function authenticateMockUser(email: string, _password: string) {
  const normalized = email.trim().toLowerCase();
  const role = normalized.includes("distributor") ? "distributor" : "sales";

  return fetchMockSession(role);
}

export function shouldUseMock() {
  return SHOULD_USE_MOCK;
}
