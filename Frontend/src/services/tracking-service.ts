import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Location {
  _id: string;
  employeeId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export function useTrackingService() {
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["tracking-locations"],
    queryFn: async () => {
      const { data } = await apiClient.get("/tracking/latest");
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  return {
    locations,
    isLoading,
  };
}
