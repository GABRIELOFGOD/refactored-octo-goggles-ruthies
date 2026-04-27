// lib/api/categories.ts

import { ICategory } from "@/types";

export async function getCategories(): Promise<ICategory[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/categories`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch categories");
  }

  return data.data;
}