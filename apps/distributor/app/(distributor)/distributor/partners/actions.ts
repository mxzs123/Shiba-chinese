"use server";

import type {
  DistributorPartner,
  DistributorPartnerApplication,
  DistributorPartnerApplicationInput,
  DistributorPartnerStatus,
  Paginated,
} from "@shiba/models";
import { distributorPartnerApplicationInputSchema } from "@shiba/models";

import {
  fetchMockPartnerApplications,
  fetchMockPartners,
  shouldUseMock,
  submitMockPartnerApplication,
  updateMockPartnerStatus,
} from "../../../../lib/mock/server-actions";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchPartnersAction(): Promise<
  ActionResult<Paginated<DistributorPartner>>
> {
  if (!shouldUseMock()) {
    return { success: false, error: "伙伴服务暂未接通，请使用 Mock 数据" };
  }

  const result = await fetchMockPartners();
  return { success: true, data: result };
}

export async function updatePartnerStatusAction(
  partnerId: string,
  status: DistributorPartnerStatus,
): Promise<ActionResult<DistributorPartner>> {
  if (!partnerId) {
    return { success: false, error: "伙伴标识无效" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "伙伴服务暂未接通，请使用 Mock 数据" };
  }

  const partner = await updateMockPartnerStatus(partnerId, status);
  if (!partner) {
    return { success: false, error: "伙伴不存在或已被移除" };
  }

  return { success: true, data: partner };
}

export async function submitPartnerApplicationAction(
  input: DistributorPartnerApplicationInput,
): Promise<ActionResult<DistributorPartnerApplication>> {
  const parsed = distributorPartnerApplicationInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "申请信息不完整，请检查必填项" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "伙伴服务暂未接通，请使用 Mock 数据" };
  }

  const application = await submitMockPartnerApplication(parsed.data);
  return { success: true, data: application };
}

export async function fetchPartnerApplicationsAction(): Promise<
  ActionResult<DistributorPartnerApplication[]>
> {
  if (!shouldUseMock()) {
    return { success: false, error: "伙伴服务暂未接通，请使用 Mock 数据" };
  }

  const applications = await fetchMockPartnerApplications();
  return { success: true, data: applications };
}
