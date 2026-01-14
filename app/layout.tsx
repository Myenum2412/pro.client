import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { HolidayPreloader } from "@/components/holiday-preloader";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Proultima - Project Management Platform",
    template: "%s | Proultima",
  },
  description: "Manage your construction projects, drawings, submissions, and billing all in one place",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Proultima",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.className} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <HolidayPreloader />
          <ServiceWorkerRegister />
          <PWAInstallPrompt />
          {children}
        </Providers>
      </body>
    </html>
  );
}
