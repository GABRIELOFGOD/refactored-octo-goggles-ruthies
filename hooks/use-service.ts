import { toast } from "sonner"

export const useService = () => {

  const getServices = async () => {
    try {
      const request = await fetch("/api/services");
      const response = await request.json();
      return response.data;
    } catch (error: any) {
      toast.error(error.error || error.message || 'Error fetching services');
      console.error(error);
    }
  }

  return { getServices };
  
}