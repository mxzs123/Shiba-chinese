import type { Menu, Page } from "./types";
import { menus, pages } from "./mock-data";

export async function getMenu(handle: string): Promise<Menu[]> {
  return menus[handle] || [];
}

export async function getPage(handle: string): Promise<Page | undefined> {
  return pages.find((entry) => entry.handle === handle);
}

export async function getPages(): Promise<Page[]> {
  return pages;
}
