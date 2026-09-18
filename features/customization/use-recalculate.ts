import { useMutation } from "@tanstack/react-query";
import { recalculatePackage } from "@/lib/api/client";
import type { CustomizationRequest } from "@/domain/travel/types";

export function useRecalculatePackage(packageId: string) {
  return useMutation({
    mutationFn: (customization: CustomizationRequest) => recalculatePackage(packageId, customization),
  });
}
