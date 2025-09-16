import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";
import React from "react";
import {Providers} from "@/app/Providers";
import Navbar from "@/components/layout/Navbar/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata : Metadata = {
    title: "Aika | Unified Calendar Sync",
    description:
        "Aika lets you sync, manage, and monitor calendars from multiple providers in one streamlined dashboard. Built for teams, powered by modern tech.",
    keywords: [
        "calendar sync",
        "calendar integration",
        "event manager",
        "Prisma",
        "Next.js",
        "Aika app",
        "calendar API",
        "webhooks",
    ],
    icons: {
        icon: "/icon.svg",
        shortcut: "/icon.svg",
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
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-purple-100 via-white to-blue-100 min-h-screen`}
        >
            <Providers>
                <Toaster position="top-right" expand={true} richColors />
                {children}
            </Providers>
        </body>
    </html>
  );
}
