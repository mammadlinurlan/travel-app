import type { TransferOffer, Travelers } from "@/domain/travel/types";

export interface TransferSearchRequest {
  destination: string;
  travelers: Travelers;
}

export interface TransferProvider {
  searchTransfers(request: TransferSearchRequest): Promise<TransferOffer[]>;
}
