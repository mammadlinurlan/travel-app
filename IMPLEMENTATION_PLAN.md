# AI Travel Package Platform — Implementation Plan

Working plan derived from the master prompt. This file is the source of truth for
scope and progress; update the checkboxes as phases complete.

## Repo state (as of Phase 1 start)

- Fresh `create-next-app`: Next.js 16.3.5, React 19.2.8, App Router, Tailwind v4, TS strict.
- No `src/` — app code lives at repo root in `app/`.
- No extra deps installed yet (no shadcn, Phosphor, Framer Motion, TanStack, Zod).
- `app/globals.css` uses default Tailwind v4 `@theme inline` tokens + Geist fonts — will be
  replaced with the Navy/Ivory/Sand/Gold design system + Montserrat.

## Target structure (adapted to this repo — no `src/`)

```
app/
  page.tsx                      landing + search
  layout.tsx
  api/
    trips/search/route.ts
    trips/search/[id]/route.ts
    packages/[id]/route.ts
    packages/[id]/recalculate/route.ts
    offers/route.ts
components/
  ui/                           shadcn primitives
  travel/                       DestinationSearch, PackageCard, etc.
features/
  search/
  packages/
  customization/
domain/
  travel/
    types.ts
    package-engine.ts
    ranking.ts
    pricing.ts
    validation.ts
providers/
  flights/  (flight-provider.ts, duffel-flight-provider.ts, mock-flight-provider.ts)
  hotels/   (hotel-provider.ts, ratehawk-hotel-provider.ts, mock-hotel-provider.ts)
  transfers/(transfer-provider.ts, mock-transfer-provider.ts)
  currency/
  location/
  activities/
lib/
  config/                       design tokens, env, markup config
  utils/
```

## Phases

- [x] **Phase 1 — Foundation**
  - [x] Install deps: shadcn/ui, @phosphor-icons/react, framer-motion,
        @tanstack/react-form, @tanstack/react-query, zod
  - [x] Configure Montserrat via `next/font/google` (`--font-sans`)
  - [x] Design tokens in `globals.css` (exact palette from spec) + Tailwind v4 `@theme`
  - [x] `lib/config/design-tokens.ts`
  - [x] shadcn init, baseline primitives (Button, Dialog, Sheet, Select, Calendar, Slider, Tabs, Badge, Skeleton, Tooltip, Separator, Popover, Checkbox, Radio Group)
  - [x] Swapped shadcn's internal lucide-react icons for Phosphor equivalents (single icon library, per spec); removed lucide-react dependency
  - [x] `components/providers/query-provider.tsx` wired into root layout
  - [x] `.env.example`
  - [x] `npm run build` and `npm run lint` verified clean
- [x] **Phase 2 — Premium UI**: landing hero, TripSearchForm (TanStack Form + Zod) with
      DestinationSearch, TravelDatePicker, TravelerSelector, BudgetSelector,
      HotelPreferenceSelector, MealPlanSelector, trip-style tabs, NaturalLanguageInput
- [x] **Phase 3 — Mock Search**: domain models (`domain/travel/types.ts`), destination-specific
      mock inventory (`providers/mock-data/destinations.ts`), Mock{Flight,Hotel,Transfer}Provider
      with seeded PRNG for stable variety
- [x] **Phase 4 — Package Generation**: `domain/travel/package-engine.ts` (combination generation,
      compatibility filtering, budget fallback with "closest options" messaging),
      `pricing.ts` (supplier cost + configurable markup), `ranking.ts` (weighted scoring,
      Cheapest/Best Value/Premium categorization)
- [x] **Phase 5 — Results**: SearchProgress (staged Framer Motion animation), PackageResults
      (grid, sort tabs, warnings banner, empty state), PackageCard + Flight/Hotel/Transfer
      summaries, RecommendationBadge
- [x] **Phase 6 — Package Details**: Sheet-based PackageDetails with TripTimeline, price
      breakdown, PackageScore reasons
- [x] **Phase 7 — Customization**: PackageCustomizer (switch flight/hotel+room/transfer from
      the same search's inventory), server-side recalculation via `useRecalculatePackage`,
      animated price transitions in PackagePrice
- [x] **Phase 8 — API Layer**: all routes implemented and manually verified end-to-end
      (search → package → recalculate → offer), including validation-error and not-found paths
- [x] **Phase 9 — Real Providers**: `DuffelFlightProvider` implemented against Duffel's
      documented Offer Request flow (untested — no sandbox key available in this environment);
      `RateHawkHotelProvider`/`RateHawkTransferProvider` intentionally throw with a clear
      "docs/credentials unavailable" message per the no-invented-endpoints rule.
      `TRAVEL_PROVIDER_MODE=live` without provider keys still falls back to mock.
      StaticCurrencyProvider (approximate, clearly labeled) and MockLocationProvider ship
      behind their interfaces so a real Google Maps/FX integration can drop in later.
- [x] **Phase 10 — AI**: `/api/ai/parse-trip` (OpenAI structured output, Zod-validated,
      graceful 503 when `OPENAI_API_KEY` is unset) + NaturalLanguageInput wired into the form
- [x] **Phase 11 — Production Polish (partial)**: responsive Tailwind layout, reduced-motion-safe
      Framer Motion usage, empty/error states, `tsc --noEmit` / `eslint` / `next build` all clean.
      Not done: no browser/visual QA pass (headless browser tooling wasn't available in this
      environment) and no automated tests.

## Verified end-to-end (via curl against `next dev`)

- `POST /api/trips/search` → realistic Phuket packages, correct AZN→USD budget conversion,
  budget-fallback warning when nothing fits
- `GET /api/packages/:id`, `POST /api/packages/:id/recalculate` (price changes server-side,
  rejects invalid selections)
- `POST /api/offers`, 400s on invalid input, 404 on unknown package, 503 from the AI route
  without an `OPENAI_API_KEY`

## Post-MVP simplification (round 2)

Removed **meal plan** and **near-the-beach** as user-facing search inputs too.
Search form is now: destination, dates, travelers, hotel stars, airport
transfer, cabin class. `Room.mealPlan` and `Hotel.beachDistanceMeters` are
still real data fields (shown on package cards, used in scoring) — they're
just no longer something the user filters by upfront. `package-engine.ts`
now generates a package per compatible room (not one pre-matched room per
hotel), so meal-plan variety (room_only/breakfast/half_board/all_inclusive)
emerges naturally across the ranked results instead of being pre-selected.

## Post-MVP simplification

Per product feedback, the search form was simplified: removed **budget** and
**trip style** (beach/city/romantic/etc.) entirely. The search now runs on
destination, dates, traveler count, hotel stars, meal plan, near-beach,
transfer, and cabin class only. `TravelPackage.price` still reports the real
computed price — there's just no user-set ceiling filtering results anymore;
ranking (`domain/travel/ranking.ts`) already scored price relative to the
candidate set, not against an external budget, so behavior degrades cleanly.

## Premium redesign of the results experience

Full visual rebuild of the search-results page against a new brand system —
primary `#193250`, background `#F7F8F5`, accent `#FEE286` (fills only),
text `#102235`, muted `#718096`, border `#E5E7EB`, Montserrat throughout.
Palette is remapped at the token level in `app/globals.css`, so every
existing component inherited it without per-file rewrites.

What changed:
- **`components/layout/SiteHeader.tsx`** (new) — minimal nav (logo, Explore /
  My Trips / Help, Account) with a `transparent` variant floating over the
  landing hero and a `solid` sticky variant in-app.
- **`components/travel/PackageCard.tsx`** — rebuilt around a strict hierarchy:
  image (~132px) → hotel name → rating → flight panel → inclusion chips →
  price + CTA. Secondary detail (return leg, baggage, transfer vehicle,
  recommendation reasons) moved off the card into the detail sheet.
  `FlightSummary` / `HotelSummary` / `TransferSummary` were absorbed and deleted.
- **`features/packages/ResultsToolbar.tsx`** (new) — back link, headline,
  result count and a compact sort dropdown, freeing the sidebar for filters only.
- **`features/packages/PackageFilters.tsx`** — compact sectioned panel; adds a
  price-range filter and turns cabin class into a radio group. All previous
  filters kept.
- **`features/packages/AlternativeTrips.tsx`** (new) — results beyond the first
  six render as an editorial horizontal scroller, visually distinct from the grid.
- **`features/packages/PackageResults.tsx`** — sidebar + responsive grid
  (3 / 2 / 1 columns) and a mobile filter drawer with a "Show N trips" action.
- **`features/packages/PackageDetails.tsx`** — now titled by hotel name (it was
  showing the street address) and carries the full flight/stay/baggage detail.

Bugs found and fixed while verifying with real data:
- The sort control rendered its raw value (`recommended`) because Base UI's
  `Select.Value` does not resolve item labels — the trigger now renders the label.
- Unchecking one airline selected *only* that airline (empty-means-all was not
  expanded before toggling).
- `Sheet` sets width via `data-[side=…]` variants, which outranked the plain
  `w-full` / `sm:max-w-xl` classes — both sheets were stuck at 75% width.
- Landing form labels inherited `text-center` from the hero.

Verified by driving the real app over the Chrome DevTools Protocol
(landing → destination autocomplete → date range → search → results) plus
screenshots at 390 / 820 / 1280 / 1440px; `scrollWidth === clientWidth` at
every breakpoint, so there is no horizontal overflow.

## Hotels: LiteAPI (Nuitee Connect) — live and verified

Found via real research after Duffel Stays turned out to need sales approval:
LiteAPI (`docs.liteapi.travel`) is genuinely self-serve — signup at
Nuitee Connect, no company/credit card required, sandbox key prefixed
`sand_`. `providers/hotels/liteapi-hotel-provider.ts` implements the
documented single-call `POST /hotels/rates` flow (accepts `iataCode`
directly — same airport codes already used for Duffel flights — plus
`starRating`, `includeHotelData`, occupancies). Live-tested with the user's
real sandbox key against Antalya: returned 18 real hotels (Rixos, Mardan
Palace, Crowne Plaza, etc.) with real rates, board types, cancellation
policies. Wired into `providers/index.ts` ahead of Duffel Stays, behind
RateHawk in priority (RateHawk's tour-operator package rates still preferred
once available). `.env`: `HOTEL_PROVIDER_MODE=live`, `LITEAPI_API_KEY=...`.

**Bug found and fixed via this real data**: `package-engine.ts`'s
combination loop iterated hotel-major (all of hotel #1's rooms × transfers
before moving to hotel #2). Live data can return 100+ rate plans for a
single hotel (LiteAPI returned 200 for one Antalya property) — that alone
blew past `MAX_RAW_COMBINATIONS` and `break outer` fired before any other
hotel was ever considered, collapsing 18 real hotels into 1 final package.
Fixed by capping `compatibleRooms()` to the cheapest room per meal plan per
hotel (`MAX_ROOMS_PER_HOTEL = 4`) before generating combinations — verified
with mock data (which never had this many variants) always passed silently;
only real provider data surfaced it. Re-verified end-to-end after the fix:
8 diverse packages across 6 different real hotels.

## UI restructure: filters moved to a results sidebar

Per product feedback: hotel star rating and cabin class (business toggle)
were removed from the landing search form — the landing form is now just
destination, dates, travelers, airport transfer. Star rating and cabin
class are real, provider-supported filters (LiteAPI `starRating`, Duffel
`cabin_class`), so instead of deleting them they moved to a new left
sidebar on the results page (`features/packages/PackageFilters.tsx`):
sort, hotel stars, cabin class, transfer-included toggle. Star rating and
transfer-only filter client-side against the already-fetched broad result
set (search always requests all star ratings 3–5 up front). Cabin class is
different — Duffel's business fares are a genuinely different query — so
toggling it re-calls `/api/trips/search` with the updated `cabinClass` and
replaces the results (`app/page.tsx`'s `handleCabinClassChange`), rather
than pretending to filter data that was never fetched.

## Duffel integration status (live-tested)

- **Duffel Flights: live and verified** against the real sandbox API
  (`FLIGHT_PROVIDER_MODE=live` in `.env`). Confirmed real request/response
  shapes against current Duffel docs (base URL, `Duffel-Version: v2`,
  `/air/offer_requests`, segment/price field names) and tested end-to-end —
  returns real offers (sometimes actual carriers like Pegasus, sometimes
  Duffel's sandbox test airline "Duffel Airways").
- **Duffel Stays (hotels): implemented but not enabled on this account.**
  `providers/hotels/duffel-hotel-provider.ts` implements the documented
  two-step flow (`POST /stays/search` → `POST /stays/search_results/:id/actions/fetch_all_rates`),
  including destination coordinates added to `providers/mock-data/destinations.ts`
  for the geographic search Stays requires. Live-tested against the real API;
  it correctly returns `403 "This feature is not enabled for your account.
  Please contact sales"` — Stays needs separate Duffel sales approval beyond
  a Flights sandbox key. Code is ready; flip `HOTEL_PROVIDER_MODE=live` once
  approved.
- Introduced independent `FLIGHT_PROVIDER_MODE` / `HOTEL_PROVIDER_MODE` /
  `TRANSFER_PROVIDER_MODE` env overrides (each falling back to the shared
  `TRAVEL_PROVIDER_MODE`) so one product can go live while others stay mock —
  needed because Flights and Stays turned out to have independent enablement
  on the same Duffel account.
- RateHawk requires registering as a travel business (company name, legal
  entity, bank details — not self-serve for individuals) and, per their own
  blog, has a "package rates" feature specifically for tour-operator bundling
  (cheaper, package-only pricing) — worth pursuing once the user has a
  registered company, but not required for the current mock-first MVP.

## Known gaps / follow-ups

- No automated test suite (unit tests for `package-engine`/`ranking`/`pricing` would be the
  highest-value addition)
- In-memory store (`lib/server/store.ts`) only works for a single Node process — fine for
  this environment, not for a multi-instance deployment
- No browser-level visual QA was performed in this environment (headless Chromium tooling
  unavailable); layout was validated via SSR HTML output and code review only
- `DuffelFlightProvider` is implemented but unverified against a live sandbox account

## Notes / constraints carried from the spec

- Never expose `DUFFEL_API_KEY`, `RATEHAWK_API_KEY`, `OPENAI_API_KEY` client-side.
- All package pricing/recalculation happens server-side; never trust client-sent prices.
- Package-engine logic lives in `domain/`, not in components or route handlers.
- Mock mode must be realistic (destination-specific), not `Hotel 1` / `Flight A` placeholders.
- Palette: Primary Navy `#102A43`, Deep Navy `#0B1F33`, Warm Ivory `#FAF8F3`, Soft Sand `#F1EDE4`,
  Gold `#C6A15B` (sparingly), Text `#17212B`, Muted `#667085`, Border `#E4E0D8`,
  Success `#2F7D5C`, Error `#B54747`. Font: Montserrat only.
