import type { Order } from "./types";
import { orders } from "./mock-data";

export async function getUserOrders(userId: string): Promise<Order[]> {
  return orders.filter((order) => order.customerId === userId);
}

export async function getOrderById(
  orderId: string,
): Promise<Order | undefined> {
  return orders.find((order) => order.id === orderId);
}
