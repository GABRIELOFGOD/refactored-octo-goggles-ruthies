"use client";

import { ICategory } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useCategories = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  
  const getSinglecategory = async (id: string) => {
    try {
      setLoading(true);

      const request = await fetch(`/api/admin/categories/${id}`, {
        headers: {
          "authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const response = await request.json();
      if (!request.ok) throw new Error(response.error || response.message);
      const category = response.data as ICategory;
      return category;
    } catch (error: any) {
      toast.error(error?.message || "Error fetching products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const getCategories = async () => {
    try {
      setLoading(true);

      const request = await fetch("/api/admin/categories", {
        headers: {
          "authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const response = await request.json();
      console.log("Response", response);

      setCategories(response.data);
    } catch (error: any) {
      toast.error(error?.message || "Error fetching products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getCategories();
  }, []);

  return {
    getSinglecategory,
    categories,
    refresh: getCategories,
    loading
  }
}