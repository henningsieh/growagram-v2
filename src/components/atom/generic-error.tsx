"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

interface GenericErrorProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function GenericError({ error, resetErrorBoundary }: GenericErrorProps) {
  const t = useTranslations("Errors");

  // Check if it's a network error
  const isNetworkError =
    error.message.includes("fetch") ||
    error.message.includes("network") ||
    error.message.includes("Failed to fetch");

  // Check if it's a server error
  const isServerError =
    error.message.includes("500") ||
    error.message.includes("Internal Server Error");

  return (
    <div className="py-12">
      <Alert variant="destructive" className="mx-auto max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>
          {isNetworkError
            ? t("network-title", { defaultValue: "Connection Error" })
            : isServerError
              ? t("server-title", { defaultValue: "Server Error" })
              : t("generic-title", { defaultValue: "Something went wrong" })}
        </AlertTitle>
        <AlertDescription className="mt-2">
          {isNetworkError ? (
            <p>
              {t("network-message", {
                defaultValue:
                  "Unable to connect to the server. Please check your internet connection and try again.",
              })}
            </p>
          ) : isServerError ? (
            <p>
              {t("server-message", {
                defaultValue:
                  "The server encountered an error. Please try again later.",
              })}
            </p>
          ) : (
            <p>
              {error.message ||
                t("generic-message", {
                  defaultValue:
                    "An unexpected error occurred. Please try again.",
                })}
            </p>
          )}
        </AlertDescription>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={resetErrorBoundary}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("retry-button", { defaultValue: "Try Again" })}
          </Button>
        </div>
      </Alert>

      {/* Development error details */}
      {process.env.NODE_ENV === "development" && (
        <details className="mx-auto mt-6 max-w-2xl">
          <summary className="text-muted-foreground cursor-pointer text-sm font-medium">
            {t("dev-details-title", {
              defaultValue: "Error Details (Development Only)",
            })}
          </summary>
          <pre className="bg-muted mt-2 rounded-md p-4 text-xs whitespace-pre-wrap">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
