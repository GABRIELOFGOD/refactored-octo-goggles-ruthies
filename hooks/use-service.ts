"use client";

import { useState } from "react";
import { toast } from "sonner"

export const useService = () => {
  const [loading, setLoading] = useState(false);

  const getServices = async () => {
    try {
      setLoading(true);
      const request = await fetch("/api/services");
      const response = await request.json();
      return response.data;
    } catch (error: any) {
      toast.error(error.error || error.message || 'Error fetching services');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return { getServices, loading };
  
}