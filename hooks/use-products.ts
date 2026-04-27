"use client";

import { IProduct } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getProducts = async () => {
    try {
      setLoading(true);

      const request = await fetch("/api/admin/products", {
        headers: {
          "authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const response = await request.json();

      setProducts(response.data);
    } catch (error: any) {
      toast.error(error?.message || "Error fetching products");
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

      const response = await request.json();

      if (!request.ok) throw new Error(response.error || response.message);

      const product = response.data as IProduct;

      return product;
    } catch (error: any) {
      toast.error(error?.message || "Error fetching products");
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