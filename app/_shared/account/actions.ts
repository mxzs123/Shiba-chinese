"use server";

import {
  deleteCustomerAddress,
  getCustomerAddresses,
  getCustomerCoupons,
  redeemCouponForUser,
  setDefaultCustomerAddress,
  upsertCustomerAddress,
  updateUserProfile,
  submitIdentityVerification,
  saveSurveyAssignmentDraft,
  submitSurveyAssignment,
} from "@/lib/api";
import type {
  Address,
  AddressInput,
  CustomerCoupon,
  IdentityDocumentInput,
  IdentityVerification,
  SurveyAnswer,
  SurveyAssignment,
  User,
} from "@/lib/api/types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "发生未知错误，请稍后重试";
}

type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

type UpdateProfilePayload = {
  fullName: string;
  phone?: string;
};

export async function updateProfileAction(
  userId: string,
  payload: UpdateProfilePayload,
): Promise<ActionResult<User>> {
  try {
    const fullName = payload.fullName.trim();
    if (!fullName) {
      throw new Error("请输入姓名");
    }

    const phone = payload.phone?.trim();

    if (phone && !/^\+?[0-9\-\s]{6,20}$/.test(phone)) {
      throw new Error("手机号格式不正确");
    }

    const result = await updateUserProfile(userId, {
      firstName: fullName,
      lastName: "",
      phone,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

type SaveAddressPayload = AddressInput;

type AddressListResult = {
  addresses: Address[];
  primary?: Address;
};

export async function saveAddressAction(
  userId: string,
  payload: SaveAddressPayload,
): Promise<ActionResult<AddressListResult>> {
  try {
    const saved = await upsertCustomerAddress(userId, payload);
    const addresses = await getCustomerAddresses(userId);

    return {
      success: true,
      data: {
        addresses,
        primary: saved,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function removeAddressAction(
  userId: string,
  addressId: string,
): Promise<ActionResult<AddressListResult>> {
  try {
    const addresses = await deleteCustomerAddress(userId, addressId);

    return {
      success: true,
      data: {
        addresses,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function setDefaultAddressAction(
  userId: string,
  addressId: string,
): Promise<ActionResult<AddressListResult>> {
  try {
    const primary = await setDefaultCustomerAddress(userId, addressId);
    const addresses = await getCustomerAddresses(userId);

    return {
      success: true,
      data: {
        addresses,
        primary,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

type RedeemCouponResult = {
  coupon: CustomerCoupon;
  coupons: CustomerCoupon[];
};

export async function redeemCouponAction(
  userId: string,
  code: string,
): Promise<ActionResult<RedeemCouponResult>> {
  try {
    const trimmed = code.trim();

    if (!trimmed) {
      throw new Error("请输入优惠券兑换码");
    }

    const coupon = await redeemCouponForUser(userId, trimmed);
    const coupons = await getCustomerCoupons(userId);

    return {
      success: true,
      data: {
        coupon,
        coupons,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function submitIdentityVerificationAction(
  userId: string,
  payload: IdentityDocumentInput,
): Promise<ActionResult<IdentityVerification>> {
  try {
    const result = await submitIdentityVerification(userId, payload);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function saveSurveyDraftAction(
  userId: string,
  assignmentId: string,
  answers: SurveyAnswer[],
): Promise<ActionResult<SurveyAssignment>> {
  try {
    const result = await saveSurveyAssignmentDraft(
      userId,
      assignmentId,
      answers,
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function submitSurveyAction(
  userId: string,
  assignmentId: string,
  answers: SurveyAnswer[],
): Promise<ActionResult<SurveyAssignment>> {
  try {
    const result = await submitSurveyAssignment(userId, assignmentId, answers);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
