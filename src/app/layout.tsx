import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { JSX, ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f0f11",
};

export const metadata: Metadata = {
  title: "Christmas Gift",
  description: "A special interactive Christmas experience",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Christmas Gift",
  },
  formatDetection: {
    telephone: false,
  },
};

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-midnight text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
