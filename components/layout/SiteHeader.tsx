"use client";

import { IxLogo } from "@/components/layout/IxLogo";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  /** "transparent" floats the header over the hero image; "solid" is the in-app bar. */
  variant?: "solid" | "transparent";
  onHome?: () => void;
  /** Hides the wordmark below `sm` — screens that already carry their own context in the bar. */
  hideLogoOnMobile?: boolean;
}

export function SiteHeader({ variant = "solid", onHome, hideLogoOnMobile }: SiteHeaderProps) {
  const transparent = variant === "transparent";
  const { t, locale, setLocale } = useLocale();

  const NAV_ITEMS = [
    { label: t.nav.explore, action: "home" as const },
    { label: t.nav.help, action: "placeholder" as const },
  ];

  return (
    <header
      className={cn(
        "z-30 w-full",
        "pt-[env(safe-area-inset-top)]",
        transparent
          ? "absolute inset-x-0 top-0 bg-transparent"
          : "sticky top-0 border-b border-border bg-white/85 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center gap-4 px-4 sm:gap-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onHome}
          className={cn(
            "group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2",
            hideLogoOnMobile && "hidden sm:flex",
          )}
          aria-label={t.brand.homeAria}
        >
          <div className={cn(!transparent && "rounded-lg bg-navy px-2.5 py-1.5")}>
            <IxLogo height={52} />
          </div>
        </button>

        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action === "home" ? onHome : undefined}
              className={cn(
                "group relative rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40",
                transparent ? "text-white/80 hover:text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100",
                  transparent ? "bg-white/70" : "bg-navy",
                )}
              />
            </button>
          ))}
        </nav>

        <div
          aria-label="Dil seçimi / Language"
          className={cn(
            "ml-auto flex items-center rounded-full border p-0.5 text-xs font-semibold md:ml-0",
            transparent ? "border-white/25" : "border-border",
          )}
        >
          {(["az", "en"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLocale(option)}
              aria-pressed={locale === option}
              className={cn(
                "rounded-full px-2.5 py-1 uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40",
                locale === option
                  ? transparent
                    ? "bg-white text-navy"
                    : "bg-navy text-white"
                  : transparent
                    ? "text-white/70 hover:text-white"
                    : "text-ink-muted hover:text-ink",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
