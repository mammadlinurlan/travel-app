import { useMutation } from "@tanstack/react-query";
import { parseTripIntent, parseTripIntentFromVoice } from "@/lib/api/client";

export function useParseTrip() {
  return useMutation({ mutationFn: parseTripIntent });
}

export function useParseTripVoice() {
  return useMutation({ mutationFn: parseTripIntentFromVoice });
}
