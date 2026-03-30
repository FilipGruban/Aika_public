import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";
import React from "react";
import {Providers} from "@/app/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata : Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
    title: {
        default: "Aika – Unified Calendar Sync",
        template: "%s | Aika",
    },
    description:
        "Sync, manage, and monitor calendars from multiple providers in one clean dashboard. Built for teams and power users.",
    keywords: [
        "calendar sync",
        "calendar integration",
        "calendar automation",
        "event synchronization",
        "multi calendar",
        "Aika",
    ],
    authors: [{ name: "Aika" }],
    creator: "Aika",
    icons: {
        icon: "/icon.svg",
        shortcut: "/icon.svg",
    },
    openGraph: {
        title: "Aika – Unified Calendar Sync",
        description:
            "Sync all your calendars into one streamlined dashboard.",
        url: process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000",
        siteName: "Aika",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Aika – Unified Calendar Sync",
        description:
            "Manage all your calendars in one place.",
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.96_0.03_25)_0%,transparent_50%)] pointer-events-none -z-10" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,oklch(0.96_0.03_180)_0%,transparent_50%)] pointer-events-none -z-10" />
            <Providers>
                <Toaster position="top-right" expand={true} richColors />
                {children}
            </Providers>
        </body>
    </html>
  );
}
