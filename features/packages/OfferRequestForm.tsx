"use client";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { requestOffer } from "@/lib/api/client";
import { useLocale } from "@/lib/i18n/locale-context";

interface OfferRequestFormProps {
  packageId: string;
  onDone: () => void;
}

export function OfferRequestForm({ packageId, onDone }: OfferRequestFormProps) {
  const { t } = useLocale();
  const nameSchema = z.string().min(2, t.offerForm.nameError);
  const emailSchema = z.string().email(t.offerForm.emailError);
  const mutation = useMutation({ mutationFn: requestOffer });

  const form = useForm({
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: undefined as string | undefined,
      notes: undefined as string | undefined,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({ packageId, ...value });
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-6 text-center">
        <CheckCircle className="size-8 text-success" weight="fill" />
        <p className="font-medium text-navy">{t.offerForm.successTitle}</p>
        <p className="text-sm text-ink-muted">{t.offerForm.successBody}</p>
        <Button variant="outline" onClick={onDone} className="mt-2">
          {t.offerForm.close}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-3"
    >
      <form.Field name="customerName" validators={{ onChange: nameSchema }}>
        {(field) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">
              {t.offerForm.fullName} <span className="text-error">*</span>
            </label>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-11 rounded-lg border border-border bg-white px-3 text-sm focus:border-navy focus:outline-none"
            />
            {field.state.meta.errors[0] && (
              <p className="text-xs text-error">
                {String(field.state.meta.errors[0]?.message ?? field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="customerEmail" validators={{ onChange: emailSchema }}>
        {(field) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">
              {t.offerForm.email} <span className="text-error">*</span>
            </label>
            <input
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-11 rounded-lg border border-border bg-white px-3 text-sm focus:border-navy focus:outline-none"
            />
            {field.state.meta.errors[0] && (
              <p className="text-xs text-error">
                {String(field.state.meta.errors[0]?.message ?? field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="customerPhone">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">{t.offerForm.phoneOptional}</label>
            <input
              value={field.state.value ?? ""}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-11 rounded-lg border border-border bg-white px-3 text-sm focus:border-navy focus:outline-none"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-navy">{t.offerForm.notesOptional}</label>
            <textarea
              value={field.state.value ?? ""}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={2}
              className="resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-navy focus:outline-none"
            />
          </div>
        )}
      </form.Field>

      {mutation.isError && (
        <p className="text-sm text-error">{(mutation.error as Error).message}</p>
      )}

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="mt-1 h-12 bg-navy text-ivory hover:bg-navy-deep"
      >
        {mutation.isPending ? t.offerForm.sendPending : t.offerForm.sendCta}
      </Button>
    </form>
  );
}
