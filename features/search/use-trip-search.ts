import { useMutation } from "@tanstack/react-query";
import { searchTrips } from "@/lib/api/client";

export function useTripSearch() {
  return useMutation({ mutationFn: searchTrips });
}
