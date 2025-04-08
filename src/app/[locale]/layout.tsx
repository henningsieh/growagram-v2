// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Grandstander, Nunito } from "next/font/google";
import { APP_SETTINGS } from "~/assets/constants";
import { AppFooter } from "~/components/Layouts/Footer/app-footer";
import { MainNavigationBar } from "~/components/Layouts/MainNavigationBar";
import { PhotoModalProvider } from "~/components/Layouts/photo-modal-provider";
import { EnhancedProgressProvider } from "~/components/Layouts/progress-provider";
import { ThemeProvider } from "~/components/Layouts/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/lib/trpc/react";
import "~/styles/globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const grandstander = Grandstander({
  variable: "--font-grandstander",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
  openGraph: {
    title: "Grow A Gram 🪴",
    description: "Show your Grow",
    type: "website",
    siteName: "Grow A Gram",
  },
};

type AppLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppLayout(props: AppLayoutProps) {
  return (
    <html
      className={`scroll-smooth ${nunito.variable} ${grandstander.variable}`}
      lang={(await props.params).locale}
      suppressHydrationWarning
    >
      <body className="bg-background min-h-screen font-sans antialiased">
        <EnhancedProgressProvider
          className="spinner-size-md"
          height="5px"
          color="var(--primary)"
          spinnerPosition="top-left"
          shallowRouting
        >
          <ThemeProvider
            attribute="class"
            defaultTheme={APP_SETTINGS.DEFAULT_THEME}
            enableSystem
            disableTransitionOnChange={false}
          >
            <div className="texture"></div>
            {/* Providing all messages to the client */}
            <NextIntlClientProvider messages={await getMessages()}>
              <SessionProvider>
                <TRPCReactProvider>
                  <PhotoModalProvider>
                    <Toaster richColors />
                    <div className="relative mx-auto flex max-w-7xl flex-col">
                      <MainNavigationBar />
                      <div className="flex min-h-[calc(100svh-7rem)] flex-1">
                        {props.children}
                      </div>
                      <AppFooter />
                    </div>
                  </PhotoModalProvider>
                </TRPCReactProvider>
              </SessionProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </EnhancedProgressProvider>
      </body>
    </html>
  );
}
