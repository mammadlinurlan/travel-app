import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ixTour — Bütün səfəri planlaşdır",
  description:
    "Hara getmək istədiyinizi, nə vaxt səyahət edəcəyinizi və neçə nəfər olduğunuzu bizə deyin. Sizin üçün ən yaxşı səfər variantlarını hazırlayaq.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="az" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <LocaleProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
