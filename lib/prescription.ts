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

export type PrescriptionOrderCompliance = {
  identityCompleted: boolean;
  pendingSurveyCount: number;
  productTitles: string[];
};

export type PrescriptionComplianceByOrder = Record<
  string,
  PrescriptionOrderCompliance
>;

export type PrescriptionComplianceOverview = {
  orders: Order[];
  reviewState: PrescriptionReviewState | null;
  byOrder: PrescriptionComplianceByOrder;
  identityCompleted: boolean;
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

function collectPendingPrescriptionAssignments(assignments: SurveyAssignment[]) {
  return assignments.filter(
    (assignment) =>
      isPendingAssignment(assignment) && isPrescriptionAssignment(assignment),
  );
}

function groupAssignmentsByOrder(assignments: SurveyAssignment[]) {
  return assignments.reduce<Map<string, SurveyAssignment[]>>((acc, assignment) => {
    const list = acc.get(assignment.orderId) ?? [];
    list.push(assignment);
    acc.set(assignment.orderId, list);
    return acc;
  }, new Map());
}

function createComplianceMap(
  orders: Order[],
  assignmentsByOrder: Map<string, SurveyAssignment[]>,
  identityCompleted: boolean,
): PrescriptionComplianceByOrder {
  const result: PrescriptionComplianceByOrder = {};

  for (const order of orders) {
    const orderAssignments = assignmentsByOrder.get(order.id) ?? [];

    if (!orderAssignments.length) {
      continue;
    }

    const pendingSurveyCount = orderAssignments.length;
    const requiresAction = !identityCompleted || pendingSurveyCount > 0;

    if (!requiresAction) {
      continue;
    }

    result[order.id] = {
      identityCompleted,
      pendingSurveyCount,
      productTitles: collectProductTitles(order, orderAssignments),
    };
  }

  return result;
}

function deriveReviewState(
  orders: Order[],
  sortedAssignments: SurveyAssignment[],
  identityCompleted: boolean,
): PrescriptionReviewState | null {
  if (!sortedAssignments.length) {
    return null;
  }

  const primaryAssignment = sortedAssignments[0]!;
  const primaryOrder = orders.find((order) => order.id === primaryAssignment.orderId);

  if (!primaryOrder || !isPendingOrder(primaryOrder)) {
    return null;
  }

  const pendingAssignments = sortedAssignments.filter(
    (assignment) => assignment.orderId === primaryOrder.id,
  );

  const requiresAction = !identityCompleted || pendingAssignments.length > 0;

  if (!requiresAction) {
    return null;
  }

  const productTitles = collectProductTitles(primaryOrder, pendingAssignments);

  return {
    order: primaryOrder,
    pendingAssignments,
    identityCompleted,
    productTitles,
  };
}

export async function loadPrescriptionComplianceOverview(
  user: User,
): Promise<PrescriptionComplianceOverview> {
  const identityStatus = user.identityVerification?.status ?? "unverified";
  const identityCompleted = identityStatus === "verified";

  const [orders, assignments] = await Promise.all([
    getUserOrders(user.id),
    getSurveyAssignmentsByUser(user.id),
  ]);

  const relevantAssignments = collectPendingPrescriptionAssignments(assignments);
  const sortedAssignments = sortAssignmentsByRecency(relevantAssignments);
  const assignmentsByOrder = groupAssignmentsByOrder(relevantAssignments);

  const byOrder = createComplianceMap(
    orders,
    assignmentsByOrder,
    identityCompleted,
  );

  const reviewState = deriveReviewState(
    orders,
    sortedAssignments,
    identityCompleted,
  );

  return {
    orders,
    reviewState,
    byOrder,
    identityCompleted,
  };
}

export async function loadPrescriptionReviewState(
  user: User,
): Promise<PrescriptionReviewState | null> {
  const overview = await loadPrescriptionComplianceOverview(user);

  return overview.reviewState;
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
