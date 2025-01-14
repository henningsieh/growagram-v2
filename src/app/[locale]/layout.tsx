// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { APP_SETTINGS } from "~/assets/constants";
import { MainNavigationBar } from "~/components/Layouts/MainNavigationBar";
import { ThemeProvider } from "~/components/Layouts/theme-provider";
import { ChatButton } from "~/components/features/Chat/chat-button";
import { Toaster } from "~/components/ui/toaster";
import { TRPCReactProvider } from "~/lib/trpc/react";
import { HydrateClient } from "~/lib/trpc/server";
import "~/styles/globals.css";

const geistSans = localFont({
  src: "../../lib/fonts/GeistMonoVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../lib/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Grow A Gram 🪴",
  description: "Show your Grow",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png",
  },
  manifest: "/site.webmanifest",
};

type AppLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppLayout(props: AppLayoutProps) {
  return (
    <html
      className="scroll-smooth"
      lang={(await props.params).locale}
      // suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={APP_SETTINGS.DEFAULT_THEME}
          enableSystem
          disableTransitionOnChange={false}
        >
          <NextTopLoader
            color="hsl(var(--primary))"
            speed={900}
            showSpinner={false}
            initialPosition={0.28}
          />
          {/* Providing all messages to the client */}
          <NextIntlClientProvider messages={await getMessages()}>
            <SessionProvider>
              <TRPCReactProvider>
                <HydrateClient>
                  <Toaster />
                  <div className="relative mx-auto flex max-w-7xl flex-col">
                    <MainNavigationBar />
                    <div className="flex-1">{props.children}</div>
                    <ChatButton />
                  </div>
                </HydrateClient>
              </TRPCReactProvider>
            </SessionProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
