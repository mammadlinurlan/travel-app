"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Airplane, Bed, Car, Check, ForkKnife, MagicWand } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { IxMark } from "@/components/layout/IxLogo";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

const STAGE_ICONS = [Airplane, Bed, ForkKnife, Car, MagicWand];

const STAGE_DURATION_MS = 650;

interface SearchProgressProps {
  onHome?: () => void;
}

export function SearchProgress({ onHome }: SearchProgressProps) {
  const { t } = useLocale();
  const STAGES = t.searchProgress.stages.map((label, i) => ({ label, icon: STAGE_ICONS[i] }));
  const [activeIndex, setActiveIndex] = useState(0);
  // Local, presentation-only progress within the *current* stage — drives the
  // per-row percentage/progress-bar treatment. Doesn't touch the stage model.
  const [rowProgress, setRowProgress] = useState(0);
  // Reset synchronously during render when the stage changes (React's
  // documented "adjusting state when a prop changes" pattern) rather than in
  // an effect, which would trigger an extra cascading render.
  const [rowProgressStage, setRowProgressStage] = useState(activeIndex);
  if (rowProgressStage !== activeIndex) {
    setRowProgressStage(activeIndex);
    setRowProgress(0);
  }

  useEffect(() => {
    if (activeIndex >= STAGE_ICONS.length - 1) return;
    const timer = setTimeout(() => setActiveIndex((i) => i + 1), STAGE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      setRowProgress(Math.min(96, ((Date.now() - start) / STAGE_DURATION_MS) * 100));
    }, 60);
    return () => clearInterval(tick);
  }, [activeIndex]);

  return (
    <section className="relative flex h-full flex-col overflow-hidden bg-ivory">
      <SiteHeader variant="solid" onHome={onHome} />

      <div className="relative mx-auto flex h-full w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-4 py-16 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative mb-1 flex size-16 items-center justify-center">
            <span className="anim-orbit absolute inset-0 rounded-full border-2 border-dashed border-gold/40" />
            <span className="anim-counter absolute inset-0 flex items-center justify-start">
              <span className="-ml-1.5 size-2.5 rounded-full bg-gold shadow-[0_0_10px_rgba(181,103,61,0.5)]" />
            </span>
            <IxMark height={16} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
            {t.searchProgress.eyebrow}
          </span>
          <h2 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {t.searchProgress.title}
          </h2>
          <p className="max-w-sm text-sm text-ink-muted">{t.searchProgress.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full flex-col gap-3"
        >
          {STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const done = index < activeIndex;
            const active = index === activeIndex;
            const percent = done ? 100 : active ? rowProgress : 0;
            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: index <= activeIndex ? 1 : 0.55, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "rounded-2xl border p-4 text-left shadow-card",
                  active ? "border-gold/40 bg-white" : "border-border bg-white"
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        done ? "bg-success/10" : active ? "bg-gold/15" : "bg-sand"
                      )}
                    >
                      {done ? (
                        <Check className="size-4 text-success" weight="bold" aria-hidden />
                      ) : active ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        >
                          <Icon className="size-4 text-gold-deep" weight="duotone" />
                        </motion.span>
                      ) : (
                        <Icon className="size-4 text-ink-muted" weight="regular" />
                      )}
                    </span>
                    <span className={active ? "truncate text-sm font-medium text-ink" : "truncate text-sm text-ink-muted"}>
                      {stage.label}
                    </span>
                  </div>
                  {done ? (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <Check className="size-3" weight="bold" style={{ color: "var(--success)" }} aria-hidden />
                    </span>
                  ) : (
                    <span className={active ? "shrink-0 text-xs font-semibold text-gold-deep" : "shrink-0 text-xs text-ink-muted/70"}>
                      {active ? `${Math.round(percent)}%` : t.searchProgress.statusNext}
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand">
                  <div
                    className="h-full rounded-full transition-all duration-150"
                    style={{ width: `${percent}%`, backgroundColor: done ? "var(--success)" : "var(--gold)" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="max-w-sm text-xs text-ink-muted">{t.searchProgress.caption}</p>
      </div>
    </section>
  );
}

export const SEARCH_PROGRESS_MIN_DURATION_MS = STAGE_DURATION_MS * STAGE_ICONS.length;
