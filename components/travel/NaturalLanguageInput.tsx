"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowUp, Sparkle, WarningCircle, X } from "@phosphor-icons/react/dist/ssr";
import { useLocale } from "@/lib/i18n/locale-context";

interface NaturalLanguageInputProps {
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
  initialText?: string;
}

export function NaturalLanguageInput({ onSubmit, isSubmitting, error, initialText }: NaturalLanguageInputProps) {
  const { t } = useLocale();
  const [text, setText] = useState(initialText ?? "");
  const [open, setOpen] = useState(Boolean(initialText));

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 self-start rounded-full border border-gold/30 bg-gold/10 py-1.5 pl-2 pr-3.5 text-sm font-medium text-navy transition-colors hover:border-gold/50 hover:bg-gold/15"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-gold/20 transition-colors group-hover:bg-gold/30">
          <Sparkle className="size-3.5 text-gold-deep" weight="fill" />
        </span>
        {t.search.nlToggle}
      </button>
    );
  }

  const canSubmit = !isSubmitting && text.trim().length >= 3;

  function handleSubmit() {
    if (canSubmit) onSubmit(text);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          <Sparkle className="size-3.5 text-gold-deep" weight="fill" />
          {t.search.nlLabel}
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="flex size-5 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-black/5 hover:text-ink"
        >
          <X className="size-3" weight="bold" />
        </button>
      </div>

      <div className="relative rounded-3xl border border-border bg-white shadow-sm transition-colors focus-within:border-gold-deep focus-within:ring-4 focus-within:ring-gold/15">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.search.nlPlaceholder}
          rows={2}
          autoFocus
          className="w-full resize-none rounded-3xl bg-transparent py-3.5 pl-4 pr-14 text-sm leading-relaxed text-ink placeholder:text-ink-muted/70 focus:outline-none"
        />
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          aria-label={t.search.nlFillCta}
          className="absolute bottom-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-navy text-ivory transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:bg-ink-muted/30"
        >
          <ArrowUp className="size-4.5" weight="bold" />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
          <WarningCircle className="mt-0.5 size-3.5 shrink-0" weight="fill" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
