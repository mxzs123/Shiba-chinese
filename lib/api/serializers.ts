import type {
  Address,
  AddressInput,
  CustomerCoupon,
  IdentityDocument,
  IdentityVerification,
  Membership,
  PointAccount,
  SurveyAnswer,
  SurveyAssignment,
  SurveyTemplate,
  SurveyUploadedFile,
  User,
} from "./types";

export function formatAddressLines(address: Address) {
  const detailedLines = address.address1
    ? address.address1
        .split(/\n+/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    : [];

  const localityLine = [address.city, address.district]
    .filter((value) => Boolean(value && value.trim().length > 0))
    .join(", ");

  const regionLine = [address.province, address.postalCode]
    .filter((value) => Boolean(value && value.trim().length > 0))
    .join(" ");

  const countryLine = [
    address.country,
    address.countryCode ? `(${address.countryCode.toUpperCase()})` : undefined,
  ]
    .filter((value) => Boolean(value && value.trim().length > 0))
    .join(" ");

  const lines = [
    ...detailedLines,
    address.address2,
    localityLine,
    regionLine,
    countryLine,
  ].filter((value): value is string =>
    Boolean(value && value.trim().length > 0),
  );

  return lines.length ? lines : undefined;
}

function normaliseDialCode(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.replace(/\s+/g, "").replace(/^\+/, "");
  if (!trimmed) {
    return undefined;
  }

  return `+${trimmed}`;
}

export function cloneAddress(address: Address): Address {
  return {
    ...address,
    email: address.email?.trim() || undefined,
    formatted: address.formatted
      ? [...address.formatted]
      : formatAddressLines(address),
  };
}

export function clonePointAccount(account: PointAccount): PointAccount {
  return {
    ...account,
    transactions: account.transactions.map((entry) => ({ ...entry })),
  };
}

export function cloneMembership(membership: Membership): Membership {
  return {
    ...membership,
    benefits: [...membership.benefits],
    next: membership.next ? { ...membership.next } : undefined,
  };
}

export function cloneCustomerCoupon(coupon: CustomerCoupon): CustomerCoupon {
  return {
    ...coupon,
    coupon: { ...coupon.coupon },
  };
}

export function cloneIdentityDocument(
  document: IdentityDocument,
): IdentityDocument {
  return {
    ...document,
  };
}

export function cloneIdentityVerification(
  verification: IdentityVerification,
): IdentityVerification {
  return {
    ...verification,
    document: verification.document
      ? cloneIdentityDocument(verification.document)
      : undefined,
  };
}

function cloneSurveyUploadedFile(file: SurveyUploadedFile): SurveyUploadedFile {
  return { ...file };
}

export function cloneSurveyAnswer(answer: SurveyAnswer): SurveyAnswer {
  const value = answer.value;

  let clonedValue = value;

  if (Array.isArray(value)) {
    if (!value.length) {
      clonedValue = [];
    } else if (typeof value[0] === "string") {
      clonedValue = [...(value as string[])];
    } else {
      clonedValue = (value as SurveyUploadedFile[]).map((file) =>
        cloneSurveyUploadedFile(file),
      );
    }
  }

  return {
    ...answer,
    value: clonedValue,
  };
}

export function cloneSurveyAssignment(
  assignment: SurveyAssignment,
): SurveyAssignment {
  return {
    ...assignment,
    productIds: [...assignment.productIds],
    productTitles: [...assignment.productTitles],
    answers: assignment.answers.map(cloneSurveyAnswer),
  };
}

export function cloneSurveyTemplate(template: SurveyTemplate): SurveyTemplate {
  return {
    ...template,
    productTags: template.productTags ? [...template.productTags] : undefined,
    productIds: template.productIds ? [...template.productIds] : undefined,
    questions: template.questions.map((question) => {
      if (
        question.type === "single_choice" ||
        question.type === "multiple_choice"
      ) {
        return {
          ...question,
          options: question.options.map((option) => ({ ...option })),
        };
      }

      return { ...question };
    }),
  };
}

export function cloneUser(user: User): User {
  return {
    ...user,
    defaultAddress: user.defaultAddress
      ? cloneAddress(user.defaultAddress)
      : undefined,
    addresses: user.addresses.map(cloneAddress),
    loyalty: user.loyalty ? clonePointAccount(user.loyalty) : undefined,
    membership: user.membership ? cloneMembership(user.membership) : undefined,
    coupons: user.coupons ? user.coupons.map(cloneCustomerCoupon) : undefined,
    identityVerification: user.identityVerification
      ? cloneIdentityVerification(user.identityVerification)
      : undefined,
  };
}

export function createAddressRecord(input: AddressInput): Address {
  const address: Address = {
    id: input.id || `addr-${crypto.randomUUID()}`,
    firstName: (input.firstName || "").trim(),
    lastName: (input.lastName || "").trim(),
    phone: input.phone?.trim() || undefined,
    phoneCountryCode: normaliseDialCode(input.phoneCountryCode),
    wechat: input.wechat?.trim() || undefined,
    email: input.email?.trim() || undefined,
    company: input.company?.trim() || undefined,
    country: input.country?.trim() || "中国",
    countryCode: input.countryCode?.trim().toUpperCase() || "CN",
    province: input.province?.trim() || undefined,
    city: (input.city || "").trim(),
    district: input.district?.trim() || undefined,
    postalCode: input.postalCode?.trim() || undefined,
    address1: (input.address1 || "").trim(),
    address2: input.address2?.trim() || undefined,
    isDefault: Boolean(input.isDefault),
  };

  const formatted = formatAddressLines(address);
  if (formatted) {
    address.formatted = formatted;
  }

  return address;
}
