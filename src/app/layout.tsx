import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionProvider from "@/providers/SessionProvider";
import ThemeProvider from "@/providers/ThemeProvider";


const lastik = localFont({
  src: [{
    path: "../../public/fonts/Lastik-Regular.ttf",
    weight: "400",
    style: "normal",
  }],
  variable: "--font-logo",
  display: "swap",
});

const switzer = localFont({
  src: [
    {
      path: "../../public/fonts/Switzer-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Switzer-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Switzer-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Switzer-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-switzer",
  fallback: ["system-ui", "sans-serif"],
});

import { Figtree } from "next/font/google";
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HealTalk - Professional Mental Health Support",
  description: "Connect with licensed psychologists from the comfort of your home. Professional mental health support, whenever you need it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lastik.variable} ${switzer.variable} ${figtree.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <SessionProvider>
            <div className="min-h-screen w-full bg-background">
              {children}
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
