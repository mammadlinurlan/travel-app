"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Airplane, Bed, Car, CheckCircle, Circle, ForkKnife, MagicWand } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useLocale } from "@/lib/i18n/locale-context";

const STAGE_ICONS = [Airplane, Bed, ForkKnife, Car, MagicWand];

const STAGE_DURATION_MS = 650;

interface SearchProgressProps {
  onHome?: () => void;
}

export function SearchProgress({ onHome }: SearchProgressProps) {
  const { t } = useLocale();
  const STAGES = t.searchProgress.stages.map((label, i) => ({ label, icon: STAGE_ICONS[i] }));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= STAGE_ICONS.length - 1) return;
    const timer = setTimeout(() => setActiveIndex((i) => i + 1), STAGE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const progressPercent = Math.round(((activeIndex + 0.5) / STAGES.length) * 100);
  const [sideLeft, sideTopRight, sideBottomRight] = t.searchProgress.sideLabels;

  return (
    <section className="relative flex h-full flex-col overflow-hidden bg-navy-deep">
      <Image
        src="/bg-image.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "50% 20%" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/80 via-navy-deep/55 to-navy-deep/90" />

      <SiteHeader variant="transparent" onHome={onHome} />

      <SideLabel text={sideLeft} className="left-6 top-1/2 hidden -translate-y-1/2 lg:flex" />
      <SideLabel text={sideTopRight} className="right-6 top-28 hidden text-right lg:flex" />
      <SideLabel text={sideBottomRight} className="bottom-10 right-6 hidden text-right lg:flex" />

      <div className="relative mx-auto flex h-full w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-4 py-20 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            {t.searchProgress.eyebrow}
          </span>
          <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {t.searchProgress.title}
          </h2>
          <p className="max-w-sm text-sm text-white/70">{t.searchProgress.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-2xl border border-white/15 bg-white/10 p-6 text-left shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          <div className="flex flex-col">
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const done = index < activeIndex;
              const active = index === activeIndex;
              const isLast = index === STAGES.length - 1;
              return (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: index <= activeIndex ? 1 : 0.4, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <AnimatePresence mode="wait">
                        {done ? (
                          <motion.span key="done" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <CheckCircle className="size-5 text-gold" weight="fill" />
                          </motion.span>
                        ) : active ? (
                          <motion.span
                            key="active"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                          >
                            <Icon className="size-4 text-gold" weight="duotone" />
                          </motion.span>
                        ) : (
                          <Circle className="size-3.5 text-white/40" weight="regular" />
                        )}
                      </AnimatePresence>
                    </span>
                    {!isLast && <span className="my-0.5 w-px flex-1 border-l border-dashed border-white/25" />}
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3 pb-5">
                    <span className={active ? "text-sm font-medium text-white" : "text-sm text-white/70"}>
                      {stage.label}
                    </span>
                    <span className={active ? "shrink-0 text-xs font-medium text-gold" : "shrink-0 text-xs text-white/45"}>
                      {done ? t.searchProgress.statusComplete : active ? t.searchProgress.statusActive : t.searchProgress.statusNext}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-white/80">{progressPercent}%</span>
          </div>
        </motion.div>

        <p className="max-w-sm text-xs text-white/50">{t.searchProgress.caption}</p>
      </div>
    </section>
  );
}

function SideLabel({ text, className }: { text: string; className: string }) {
  return (
    <div className={`absolute z-10 flex-col gap-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45 ${className}`}>
      {text.split("\n").map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}

export const SEARCH_PROGRESS_MIN_DURATION_MS = STAGE_DURATION_MS * STAGE_ICONS.length;
