"use client";

import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, Car, Lightning } from "@phosphor-icons/react/dist/ssr";
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
  onVoiceSubmit?: (audioBase64: string, mimeType: string) => void;
  isTranscribingVoice?: boolean;
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
  onVoiceSubmit,
  isTranscribingVoice,
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
      className="flex flex-col gap-3 rounded-3xl border border-ivory/15 bg-ivory/[0.07] p-4 text-left shadow-[0_28px_70px_-30px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:gap-4 sm:p-5"
    >
      <NaturalLanguageInput
        onSubmit={onNaturalLanguageSubmit}
        isSubmitting={isParsingNaturalLanguage}
        error={naturalLanguageError}
        initialText={initialNaturalLanguageText}
        onVoiceSubmit={onVoiceSubmit}
        isTranscribingVoice={isTranscribingVoice}
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

      <div className="flex flex-wrap items-center gap-4 border-t border-ivory/10 pt-3">
        <form.Field name="transferRequired">
          {(field) => (
            <label className="flex items-center gap-2 rounded-full border border-ivory/15 bg-ivory/[0.05] py-1.5 pl-2 pr-3 text-sm text-ivory/90">
              <Checkbox checked={field.state.value} onCheckedChange={(v) => field.handleChange(Boolean(v))} />
              <Car className="size-4 text-gold" weight="regular" />
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
        className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-semibold text-navy-deep hover:bg-gold/90"
      >
        <Lightning className="size-4" weight="fill" />
        {isSubmitting ? t.search.submitPending : t.search.submitIdle}
        <ArrowRight className="size-4" weight="bold" />
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-ivory/50">
        {t.search.trustNote}
      </p>
    </form>
  );
}
