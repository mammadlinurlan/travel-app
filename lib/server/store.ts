import type { Offer, TravelPackage, TripSearchResult } from "@/domain/travel/types";

/**
 * In-memory store for the MVP. Good enough for a single dev/demo process;
 * swap for a real datastore (Redis/Postgres) before scaling beyond one
 * instance — search state and package customization would otherwise be
 * lost on redeploy or split across instances.
 */
class TravelStore {
  private searches = new Map<string, TripSearchResult>();
  private packages = new Map<string, TravelPackage>();
  private offers = new Map<string, Offer>();
  private packageToSearch = new Map<string, string>();

  saveSearch(result: TripSearchResult) {
    this.searches.set(result.searchId, result);
    for (const pkg of result.packages) {
      this.packages.set(pkg.id, pkg);
      this.packageToSearch.set(pkg.id, result.searchId);
    }
  }

  getSearchForPackage(packageId: string): TripSearchResult | undefined {
    const searchId = this.packageToSearch.get(packageId);
    return searchId ? this.searches.get(searchId) : undefined;
  }

  getSearch(searchId: string): TripSearchResult | undefined {
    return this.searches.get(searchId);
  }

  getPackage(packageId: string): TravelPackage | undefined {
    return this.packages.get(packageId);
  }

  updatePackage(pkg: TravelPackage) {
    this.packages.set(pkg.id, pkg);
    for (const search of this.searches.values()) {
      const index = search.packages.findIndex((p) => p.id === pkg.id);
      if (index !== -1) search.packages[index] = pkg;
    }
  }

  saveOffer(offer: Offer) {
    this.offers.set(offer.id, offer);
  }

  getOffer(offerId: string): Offer | undefined {
    return this.offers.get(offerId);
  }
}

declare global {
  var __travelStore: TravelStore | undefined;
}

export const travelStore = globalThis.__travelStore ?? new TravelStore();
globalThis.__travelStore = travelStore;
