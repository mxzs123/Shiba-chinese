"use server";

import type {
  Customer,
  CustomerFollowUpCreateInput,
  CustomerFollowUpUpdateInput,
} from "@shiba/models";

import {
  createMockCustomerFollowUp,
  deleteMockCustomerFollowUp,
  fetchMockCustomerById,
  shouldUseMock,
  updateMockCustomerFollowUp,
} from "@/lib/mock/server-actions";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function isValidDate(value?: string) {
  if (!value) return false;
  return Number.isFinite(Date.parse(value));
}

function ensureCustomerExists(customer?: Customer): ActionResult<Customer> {
  if (!customer) {
    return { success: false, error: "客户不存在或已被移除" };
  }
  return { success: true, data: customer };
}

export async function createCustomerFollowUpAction(
  customerId: string,
  input: CustomerFollowUpCreateInput,
): Promise<ActionResult<Customer>> {
  const normalizedTitle = input.title.trim();

  if (!customerId) {
    return { success: false, error: "客户标识无效" };
  }

  if (!normalizedTitle) {
    return { success: false, error: "请填写跟进主题" };
  }

  if (!isValidDate(input.plannedAt)) {
    return { success: false, error: "请选择有效的跟进时间" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "客户服务暂未接通，请使用 Mock 数据" };
  }

  const customer = await createMockCustomerFollowUp(customerId, {
    ...input,
    title: normalizedTitle,
  });

  return ensureCustomerExists(customer);
}

export async function updateCustomerFollowUpAction(
  customerId: string,
  followUpId: string,
  input: CustomerFollowUpUpdateInput,
): Promise<ActionResult<Customer>> {
  if (!customerId || !followUpId) {
    return { success: false, error: "跟进记录标识无效" };
  }

  if (input.title !== undefined && !input.title.trim()) {
    return { success: false, error: "请填写有效的跟进主题" };
  }

  if (input.plannedAt !== undefined && !isValidDate(input.plannedAt)) {
    return { success: false, error: "请选择有效的跟进时间" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "客户服务暂未接通，请使用 Mock 数据" };
  }

  const customer = await updateMockCustomerFollowUp(customerId, followUpId, {
    ...input,
    title: input.title?.trim(),
  });

  return ensureCustomerExists(customer);
}

export async function deleteCustomerFollowUpAction(
  customerId: string,
  followUpId: string,
): Promise<ActionResult<Customer>> {
  if (!customerId || !followUpId) {
    return { success: false, error: "跟进记录标识无效" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "客户服务暂未接通，请使用 Mock 数据" };
  }

  const customer = await deleteMockCustomerFollowUp(customerId, followUpId);

  return ensureCustomerExists(customer);
}

export async function fetchCustomerByIdAction(
  customerId: string,
): Promise<ActionResult<Customer>> {
  if (!customerId) {
    return { success: false, error: "客户标识无效" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "客户服务暂未接通，请使用 Mock 数据" };
  }

  const customer = await fetchMockCustomerById(customerId);

  return ensureCustomerExists(customer);
}
