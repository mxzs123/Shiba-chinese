import type { Paginated } from "@shiba/models";

interface Customer {
  id: string;
  name: string;
  gender: "male" | "female";
  age: number;
  region: string;
  type: "personal" | "distributor";
  status: "in-progress" | "converted" | "pending" | "inactive";
  salesOwner: string;
  lastFollowUp: string;
  nextPlan?: string;
}

const customers: Customer[] = Array.from({ length: 18 }).map((_, index) => ({
  id: `CUS-${index + 1}`,
  name: index % 2 === 0 ? "陈楠" : "夏雨",
  gender: index % 2 === 0 ? "male" : "female",
  age: 28 + (index % 5) * 3,
  region: index % 3 === 0 ? "上海" : index % 3 === 1 ? "杭州" : "广州",
  type: index % 4 === 0 ? "distributor" : "personal",
  status:
    index % 4 === 0 ? "converted" : index % 4 === 1 ? "in-progress" : "pending",
  salesOwner: index % 2 === 0 ? "王晓" : "李华",
  lastFollowUp: "2025-10-03",
  nextPlan: index % 2 === 0 ? "2025-10-09 电话回访" : undefined,
}));

export const customersMock: Paginated<Customer> = {
  items: customers,
  page: 1,
  pageSize: customers.length,
  total: customers.length,
};
