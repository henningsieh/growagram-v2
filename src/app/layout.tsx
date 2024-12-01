// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { MainNavigationBar } from "~/components/Layouts/MainNavigationBar";
import { ThemeProvider } from "~/components/Layouts/theme-provider";
import { Toaster } from "~/components/Layouts/toaster";
import { routing } from "~/lib/i18n/routing";
import { TRPCReactProvider } from "~/lib/trpc/react";
import "~/styles/globals.css";

const geistSans = localFont({
  src: "../lib/fonts/GeistMonoVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../lib/fonts/GeistMonoVF.woff",
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

type LayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function RootLayout(props: LayoutProps) {
  // Await params before accessing params, see:
  // https://nextjs.org/docs/messages/sync-dynamic-apis
  const { locale } = await (props.params as unknown as Promise<
    typeof props.params
  >);

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as never)) {
    // notFound();
    console.debug("LOCALE NOT FOUND");
  }

  return (
    <html lang={locale} suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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
                <Toaster />
                <div className="relative mx-auto flex max-w-7xl flex-col">
                  <MainNavigationBar />
                  <div className="flex-1">{props.children}</div>
                </div>
              </TRPCReactProvider>
            </SessionProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
