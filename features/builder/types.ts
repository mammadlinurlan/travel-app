export type SlotType = "flight" | "hotel" | "transfer";

export type InventoryItemData =
  | { type: "flight"; flightId: string }
  | { type: "hotel"; hotelId: string; roomId: string }
  // A hotel picked from the inventory list before its room is chosen — clicking
  // or dropping this opens the room picker, it never fills a slot directly.
  | { type: "hotel-picker"; hotelId: string }
  | { type: "transfer"; transferId: string };

export interface SlotData {
  type: SlotType;
}
