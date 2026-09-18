"use client";

import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Car } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DestinationSearch } from "@/components/travel/DestinationSearch";
import { TravelDatePicker } from "@/components/travel/TravelDatePicker";
import { TravelerSelector } from "@/components/travel/TravelerSelector";
import { NaturalLanguageInput } from "@/components/travel/NaturalLanguageInput";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  createTripSearchFormSchema,
  defaultTripSearchValues,
  toTripSearchRequest,
  type TripSearchFormValues,
} from "./schema";
import type { TripSearchRequest } from "@/domain/travel/types";

interface TripSearchFormProps {
  onSubmit: (request: TripSearchRequest) => void;
  isSubmitting?: boolean;
  onNaturalLanguageSubmit: (text: string) => void;
  isParsingNaturalLanguage?: boolean;
  naturalLanguageError?: string | null;
  initialNaturalLanguageText?: string;
  initialValues?: Partial<TripSearchFormValues>;
  initialDestinationLabel?: string;
}

export function TripSearchForm({
  onSubmit,
  isSubmitting,
  onNaturalLanguageSubmit,
  isParsingNaturalLanguage,
  naturalLanguageError,
  initialNaturalLanguageText,
  initialValues,
  initialDestinationLabel,
}: TripSearchFormProps) {
  const { t } = useLocale();
  const [destinationLabel] = useState(initialDestinationLabel ?? "");

  const tripSearchFormSchema = useMemo(
    () =>
      createTripSearchFormSchema({
        chooseDestination: t.search.chooseDestination,
        pickDepartureDate: t.search.pickDepartureDate,
        pickReturnDate: t.search.pickReturnDate,
        returnAfterDeparture: t.search.returnAfterDeparture,
      }),
    [t]
  );

  const form = useForm({
    defaultValues: { ...defaultTripSearchValues, ...initialValues },
    validators: { onSubmit: tripSearchFormSchema },
    onSubmit: async ({ value }) => {
      onSubmit(toTripSearchRequest(value as TripSearchFormValues));
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-white/95 p-4 text-left shadow-[0_24px_60px_-28px_rgba(16,34,53,0.5)] backdrop-blur sm:gap-4 sm:p-5"
    >
      <NaturalLanguageInput
        onSubmit={onNaturalLanguageSubmit}
        isSubmitting={isParsingNaturalLanguage}
        error={naturalLanguageError}
        initialText={initialNaturalLanguageText}
      />

      <form.Field name="destination">
        {(field) => (
          <DestinationSearch
            value={field.state.value}
            label={destinationLabel}
            onChange={field.handleChange}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.Field name="departureDate">
          {(dep) => (
            <form.Field name="returnDate">
              {(ret) => (
                <div className="sm:col-span-1">
                  <TravelDatePicker
                    departureDate={dep.state.value}
                    returnDate={ret.state.value}
                    onChange={(departureDate, returnDate) => {
                      dep.handleChange(departureDate);
                      ret.handleChange(returnDate);
                    }}
                    error={dep.state.meta.errors[0]?.message ?? ret.state.meta.errors[0]?.message}
                  />
                </div>
              )}
            </form.Field>
          )}
        </form.Field>

        <form.Field name="adults">
          {(adults) => (
            <form.Field name="children">
              {(children) => (
                <form.Field name="infants">
                  {(infants) => (
                    <TravelerSelector
                      value={{ adults: adults.state.value, children: children.state.value, infants: infants.state.value }}
                      onChange={(value) => {
                        adults.handleChange(value.adults);
                        children.handleChange(value.children);
                        infants.handleChange(value.infants);
                      }}
                    />
                  )}
                </form.Field>
              )}
            </form.Field>
          )}
        </form.Field>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3">
        <form.Field name="transferRequired">
          {(field) => (
            <label className="flex items-center gap-2 text-sm text-ink">
              <Checkbox checked={field.state.value} onCheckedChange={(v) => field.handleChange(Boolean(v))} />
              <Car className="size-4 text-navy" weight="regular" />
              {t.search.airportTransfer}
            </label>
          )}
        </form.Field>
      </div>

      <form.Subscribe selector={(state) => state.errorMap}>
        {(errorMap) =>
          errorMap.onSubmit ? (
            <p className="text-sm text-error">{t.search.formError}</p>
          ) : null
        }
      </form.Subscribe>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl bg-navy text-base font-semibold text-ivory hover:bg-navy-deep"
      >
        {isSubmitting ? t.search.submitPending : t.search.submitIdle}
      </Button>
    </form>
  );
}
