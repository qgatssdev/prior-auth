import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopBar } from "@/components/top-bar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PA Desk",
  description: "Prior-authorization work queue. Portfolio demo: all data is fake.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-muted/40">
        <TopBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
