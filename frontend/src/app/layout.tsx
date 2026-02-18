import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Macro Pace — Nutrition & entraînement",
  description: "Suivez vos macros, calories et entraînements",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={plusJakarta.variable}>
      <body className="font-sans min-h-screen bg-app">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
