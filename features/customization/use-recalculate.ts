import { useMutation } from "@tanstack/react-query";
import type { CustomizationRequest } from "@/domain/travel/types";
import { recalculatePackage } from "@/lib/api/client";

export function useRecalculatePackage(packageId: string) {
  return useMutation({
    mutationFn: (customization: CustomizationRequest) =>
      recalculatePackage(packageId, customization),
  });
}
