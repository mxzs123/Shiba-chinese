import type {
  IdentityDocumentInput,
  IdentityVerification,
  User,
  UserProfileInput,
} from "./types";
import { users } from "./mock-data";
import { cloneIdentityVerification, cloneUser } from "./serializers";
import { getUserFromSessionCookie } from "./auth-store";

function findUserRecord(userId: string) {
  return users.find((user) => user.id === userId);
}

export async function getCurrentUser(): Promise<User | undefined> {
  return getUserFromSessionCookie();
}

export async function getUserById(id: string): Promise<User | undefined> {
  const user = users.find((entry) => entry.id === id);
  return user ? cloneUser(user) : undefined;
}

export async function updateUserProfile(
  userId: string,
  input: UserProfileInput,
): Promise<User> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (input.firstName !== undefined) {
    user.firstName = input.firstName.trim();
  }

  if (input.lastName !== undefined) {
    user.lastName = input.lastName.trim();
  }

  if (input.nickname !== undefined) {
    user.nickname = input.nickname.trim() || undefined;
  }

  if (input.phone !== undefined) {
    user.phone = input.phone.trim() || undefined;
  }

  user.updatedAt = new Date().toISOString();

  return cloneUser(user);
}

export async function getIdentityVerification(
  userId: string,
): Promise<IdentityVerification | undefined> {
  const user = findUserRecord(userId);

  if (!user?.identityVerification) {
    return undefined;
  }

  return cloneIdentityVerification(user.identityVerification);
}

export async function submitIdentityVerification(
  userId: string,
  input: IdentityDocumentInput,
): Promise<IdentityVerification> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!input.frontImage || !input.backImage) {
    throw new Error("身份证正反面均需上传");
  }

  const uploadedAt = new Date().toISOString();
  user.identityVerification = {
    status: "verified",
    document: {
      frontImageUrl: input.frontImage,
      backImageUrl: input.backImage,
      uploadedAt,
    },
  };
  user.updatedAt = uploadedAt;

  return cloneIdentityVerification(user.identityVerification);
}
