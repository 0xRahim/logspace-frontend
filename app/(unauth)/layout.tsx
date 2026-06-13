import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "../globals.css";

import { cn } from "@/lib/utils";
import { Providers } from "@/components/base/providers";
import { Navbar } from "@/components/base/Navbar";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "LogSpace",
  description: "Login or Create Account",
};

export default function UnauthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        dmSans.variable,
        geistSans.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-screen bg-background">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
              <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 xl:px-8">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}