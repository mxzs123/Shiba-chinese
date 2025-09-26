import {
  getSurveyAssignmentsByUser,
  getUserOrders,
} from "@/lib/api";
import type { Order, SurveyAssignment, User } from "@/lib/api/types";

const PRESCRIPTION_CATEGORY_PREFIX = "rx:";
const ORDER_COMPLETED_STATUSES = new Set(["fulfilled", "cancelled"]);

export const IDENTITY_HIGHLIGHT_HREF =
  "/account/profile?highlight=identity#identity-verification";
export const SURVEY_HIGHLIGHT_HREF =
  "/account/surveys?highlight=pending#pending";

export type PrescriptionReviewState = {
  order: Order;
  pendingAssignments: SurveyAssignment[];
  identityCompleted: boolean;
  productTitles: string[];
};

function isPrescriptionAssignment(assignment: SurveyAssignment) {
  return assignment.category?.startsWith(PRESCRIPTION_CATEGORY_PREFIX) ?? false;
}

function isPendingAssignment(assignment: SurveyAssignment) {
  return assignment.status !== "submitted";
}

function isPendingOrder(order: Order) {
  return !ORDER_COMPLETED_STATUSES.has(order.status);
}

function toTimestamp(input: string | undefined) {
  if (!input) {
    return 0;
  }

  const value = new Date(input).getTime();
  return Number.isNaN(value) ? 0 : value;
}

function sortAssignmentsByRecency(assignments: SurveyAssignment[]) {
  return assignments.slice().sort((a, b) => {
    const first = toTimestamp(a.updatedAt || a.createdAt);
    const second = toTimestamp(b.updatedAt || b.createdAt);
    return second - first;
  });
}

function collectProductTitles(
  order: Order,
  assignments: SurveyAssignment[],
) {
  const fromAssignments = assignments.flatMap((assignment) =>
    assignment.productTitles ?? [],
  );
  const fromOrder = order.lineItems.map((item) => item.productTitle);
  return Array.from(
    new Set(
      [...fromAssignments, ...fromOrder].filter(
        (title): title is string => Boolean(title && title.trim()),
      ),
    ),
  );
}

export async function loadPrescriptionReviewState(
  user: User,
): Promise<PrescriptionReviewState | null> {
  const identityStatus = user.identityVerification?.status ?? "unverified";
  const identityCompleted = identityStatus === "verified";

  const [orders, assignments] = await Promise.all([
    getUserOrders(user.id),
    getSurveyAssignmentsByUser(user.id),
  ]);

  if (!orders.length && identityCompleted) {
    return null;
  }

  const relevantAssignments = assignments.filter(
    (assignment) => isPendingAssignment(assignment) && isPrescriptionAssignment(assignment),
  );

  if (!relevantAssignments.length) {
    return null;
  }

  const sortedAssignments = sortAssignmentsByRecency(relevantAssignments);
  const primaryAssignment = sortedAssignments[0]!;
  const primaryOrder = orders.find((order) => order.id === primaryAssignment.orderId);

  if (!primaryOrder || !isPendingOrder(primaryOrder)) {
    return null;
  }

  const assignmentsForOrder = sortedAssignments.filter(
    (assignment) => assignment.orderId === primaryOrder.id,
  );

  const requiresAction = !identityCompleted || assignmentsForOrder.length > 0;
  if (!requiresAction) {
    return null;
  }

  const productTitles = collectProductTitles(primaryOrder, assignmentsForOrder);

  return {
    order: primaryOrder,
    pendingAssignments: assignmentsForOrder,
    identityCompleted,
    productTitles,
  };
}

export function getLatestOrder(orders: Order[]): Order | undefined {
  if (!orders.length) {
    return undefined;
  }

  return orders.slice().sort((a, b) => {
    const first = toTimestamp(a.processedAt || a.createdAt);
    const second = toTimestamp(b.processedAt || b.createdAt);
    return second - first;
  })[0];
}
