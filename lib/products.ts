// lib/api/products.ts

import { IProduct } from "@/types";

export async function getProduct(id: string): Promise<IProduct | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/${id}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch product");
  }

  return data.data;
}