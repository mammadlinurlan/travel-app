export interface ActivitySearchRequest {
  destination: string;
  date: string;
}

export interface ActivityOffer {
  id: string;
  name: string;
  description: string;
  price: { amount: number; currency: string };
  durationMinutes: number;
}

/**
 * Future extension point (see spec §23). Not wired into the package engine
 * for MVP. A GetYourGuide-backed implementation would live alongside this
 * interface as `getyourguide-activity-provider.ts`.
 */
export interface ActivityProvider {
  searchActivities(request: ActivitySearchRequest): Promise<ActivityOffer[]>;
}
