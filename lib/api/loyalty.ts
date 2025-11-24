import type { PointAccount, PointRule } from "./types";
import { loyaltyAccounts, pointRules } from "./mock-data";
import { clonePointAccount } from "./serializers";

export async function getLoyaltyAccount(
  userId: string,
): Promise<PointAccount | undefined> {
  const account = loyaltyAccounts.find((entry) => entry.userId === userId);

  return account ? clonePointAccount(account) : undefined;
}

export async function getPointRules(): Promise<PointRule[]> {
  return pointRules.map((rule) => ({ ...rule }));
}
