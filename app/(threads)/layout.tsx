import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "../globals.css";

import { cn } from "@/lib/utils";
import { Navbar } from "@/components/base/Navbar";
import { Providers } from "@/components/base/providers";
import { LeftSidebar } from "@/components/base/LeftSidebar";
import { RightSidebar } from "@/components/base/RightSidebar";
import { AuthGuard } from "@/components/base/AuthGuard";

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
  description: "A modern discussion forum",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <AuthGuard>
            <div className="flex min-h-screen flex-col">
              <Navbar />

              <main className="flex-1">
                <div className="mx-auto w-full max-w-[1680px] px-4 md:px-6 xl:px-8">
                  <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
                    <div className="hidden xl:block">
                      <LeftSidebar />
                    </div>

                    <div className="min-w-0">{children}</div>

                    <div className="hidden xl:block">
                      <RightSidebar />
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}