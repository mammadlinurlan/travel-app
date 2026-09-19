"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PriceBreakdown } from "@/domain/travel/types";
import { formatAmount } from "@/lib/utils/format";

interface PackagePriceProps {
  price: PriceBreakdown;
  perPerson?: number;
  size?: "sm" | "lg";
}

export function PackagePrice({ price, perPerson, size = "sm" }: PackagePriceProps) {
  return (
    <div className="flex flex-col items-end">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={price.total}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={
            size === "lg"
              ? "text-[28px] font-semibold leading-none tracking-tight text-ink"
              : "text-xl font-semibold leading-none tracking-tight text-ink"
          }
        >
          {formatAmount(price.total, price.currency)}
        </motion.span>
      </AnimatePresence>
      {perPerson !== undefined && (
        <span className="mt-1.5 text-[11px] text-ink-muted">
          {formatAmount(perPerson, price.currency)} / person
        </span>
      )}
    </div>
  );
}
