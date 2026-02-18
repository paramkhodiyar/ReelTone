import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReelTone – Create Ringtones Easily",
  description: "Download audio from YouTube/Instagram and trim them into ringtones. Local first, simple, and fast.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ReelTone",
  },
};

export const viewport: Viewport = {
  themeColor: "#FDFBF7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased bg-background text-foreground pb-20`}>
        <ToastProvider />
        <main className="min-h-screen px-4 py-8 max-w-lg mx-auto pb-24">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
