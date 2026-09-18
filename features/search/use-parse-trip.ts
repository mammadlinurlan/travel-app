import { useMutation } from "@tanstack/react-query";
import { parseTripIntent } from "@/lib/api/client";

export function useParseTrip() {
  return useMutation({ mutationFn: parseTripIntent });
}
