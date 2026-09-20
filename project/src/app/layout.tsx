import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "CLINTSTORE — Toko Akun Game #1 di Indonesia",
    template: "%s | CLINTSTORE",
  },
  description:
    "CLINTSTORE — Marketplace akun game modern, cepat, dan aman. Pembayaran otomatis, pengiriman instan setelah pembayaran berhasil.",
  keywords: [
    "jual akun game",
    "toko akun game",
    "akun ML",
    "akun Genshin",
    "akun Mobile Legends",
    "CLINTSTORE",
  ],
  openGraph: {
    title: "CLINTSTORE — Toko Akun Game #1 di Indonesia",
    description:
      "Marketplace akun game modern, cepat, dan aman. Pengiriman otomatis.",
    type: "website",
    siteName: "CLINTSTORE",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
