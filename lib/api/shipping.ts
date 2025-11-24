import type { Notification, NotificationCategory, PaymentMethod, ShippingMethod } from "./types";
import { notifications, paymentMethods, shippingMethods } from "./mock-data";
import { clonePaymentMethod, cloneShippingMethod } from "./utils";

type GetNotificationsOptions = {
  categories?: NotificationCategory[];
};

export async function getNotifications(
  options?: GetNotificationsOptions,
): Promise<Notification[]> {
  const categories = options?.categories;
  const filtered = categories?.length
    ? notifications.filter((entry) => categories.includes(entry.category))
    : notifications;

  return filtered
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  return shippingMethods.map(cloneShippingMethod);
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return paymentMethods.map(clonePaymentMethod);
}
