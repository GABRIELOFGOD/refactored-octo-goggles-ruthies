"use client";

import { ApiResponse, IProduct } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const getProducts = async () => {
    try {
      setLoading(true);

      const request = await fetch("/api/admin/products?limit=100", {
        headers: {
          "authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const response = await request.json() as ApiResponse<IProduct[]>;
      if (!request.ok || !response.data) {
        throw new Error(response.error || response.message || "Error fetching products");
      }

      setProducts(response.data);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error fetching products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSingleProduct = async (id: string) => {
    try {
      setLoading(true);
      const request = await fetch(`/api/admin/products/${id}`, {
        headers: {
          "authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const response = await request.json() as ApiResponse<IProduct>;
      if (!request.ok || !response.data) {
        throw new Error(response.error || response.message || "Error fetching product");
      }

      const product = response.data;

      return product;
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error fetching product");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  return {
    products,
    loading,
    refetch: getProducts,
    getSingleProduct
  };
};