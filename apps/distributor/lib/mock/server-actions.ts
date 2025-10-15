import "server-only";

import type {
  DistributorPartner,
  DistributorPartnerApplication,
  DistributorPartnerApplicationInput,
  DistributorPartnerStatus,
  Paginated,
  Task,
  TaskStatus,
} from "@shiba/models";
import type { DistributorOrdersMock, SalesOrdersMock } from "./orders";

import { createMockSession, createMockProfile, mockHandlers } from "./index";
import type { MockContext } from "./index";
import { getMockProfile, updateMockProfile } from "./profile";
import {
  createCustomerFollowUp,
  deleteCustomerFollowUp,
  findCustomerById,
  listCustomers,
  updateCustomerFollowUp,
} from "./customers";
import { findTaskById, updateTaskStatus } from "./tasks";
import {
  createDistributorPartnerApplication,
  listDistributorPartnerApplications,
  listDistributorPartners,
  updateDistributorPartnerStatus,
} from "./partners";

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
  type: "sales",
  ctx?: MockContext,
): Promise<SalesOrdersMock>;
export async function fetchMockOrders(
  type: "distributor",
  ctx?: MockContext,
): Promise<DistributorOrdersMock>;
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

export async function fetchMockPartners(): Promise<
  Paginated<DistributorPartner>
> {
  return listDistributorPartners();
}

export async function updateMockPartnerStatus(
  partnerId: string,
  status: DistributorPartnerStatus,
): Promise<DistributorPartner | undefined> {
  return updateDistributorPartnerStatus(partnerId, status);
}

export async function submitMockPartnerApplication(
  input: DistributorPartnerApplicationInput,
): Promise<DistributorPartnerApplication> {
  return createDistributorPartnerApplication(input);
}

export async function fetchMockPartnerApplications(): Promise<
  DistributorPartnerApplication[]
> {
  return listDistributorPartnerApplications();
}

export type WorkspaceProfileInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export async function fetchMockWorkspaceProfile(role: "sales" | "distributor") {
  return getMockProfile(role);
}

export async function updateMockWorkspaceProfile(
  role: "sales" | "distributor",
  input: WorkspaceProfileInput,
) {
  return updateMockProfile(role, input);
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
