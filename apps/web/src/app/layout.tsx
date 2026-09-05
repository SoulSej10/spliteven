import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

// Swapped from Plus Jakarta Sans per feedback ("too standard, give it
// character but still comprehensive") - Sora's rounded, slightly geometric
// letterforms are distinctive while staying legible. Mirrors the mobile
// font swap in apps/mobile/app/_layout.tsx.
const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SplitEven - Split expenses, stay even",
  description:
    "Track shared expenses with roommates, trips, and groups, and manage your own accounts, budgets, and spending alongside them. See who owes whom in real time, settle up in a tap, and stay on top of your money either way.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
