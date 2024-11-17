// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { MainNavigationBar } from "~/components/Layouts/navigation";
import { ThemeProvider } from "~/components/Layouts/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { routing } from "~/lib/i18n/routing";
import { TRPCReactProvider } from "~/lib/trpc/react";
import "~/styles/globals.css";

const geistSans = localFont({
  src: "../../lib/fonts/GeistVF.woff",
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
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <NextTopLoader
          color="hsl(var(--primary))"
          speed={900}
          showSpinner={false}
          initialPosition={0.28}
        />

        <TRPCReactProvider>
          <NextIntlClientProvider messages={messages}>
            <SessionProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <div className="relative flex min-h-screen flex-col">
                  <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
                    <div className="relative flex h-14 items-center justify-center">
                      <MainNavigationBar />
                    </div>
                  </header>
                  <main className="flex-1">{props.children}</main>
                </div>

                <Toaster />
              </ThemeProvider>
            </SessionProvider>
          </NextIntlClientProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
