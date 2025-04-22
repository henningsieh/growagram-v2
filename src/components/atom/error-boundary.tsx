"use client";

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from "react";
import { TRPCClientError } from "@trpc/client";
import { AlertCircle, Code, RefreshCw, Server, Shield } from "lucide-react";
import {
  FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Check if this is a TRPC error and extract details
  const isTRPCError = error instanceof TRPCClientError;

  let errorCode: string | number = "UNKNOWN";
  let httpStatus: number | undefined;
  let path: string | undefined;
  let detailedMessage = error.message;

  // Extract TRPC error details if available
  if (isTRPCError) {
    const trpcError = error;

    // Try to extract data from shape or data properties
    const errorData =
      trpcError.shape?.data || trpcError.data || trpcError.shape || {};

    errorCode = errorData.code || trpcError.shape?.code || "UNKNOWN";
    httpStatus = errorData.httpStatus;
    path = errorData.path;

    // Use more specific message if available
    if (trpcError.shape?.message) {
      detailedMessage = trpcError.shape.message;
    }
  }

  // Get appropriate icon and color based on error type
  const errorInfo = getErrorInfo(errorCode);

  return (
    <Card className="border-destructive mx-auto my-8 max-w-lg shadow-lg">
      <CardHeader className={`bg-${errorInfo.bgColor}`}>
        <div className="flex items-center gap-2">
          <span className={`text-${errorInfo.color}`}>{errorInfo.icon}</span>
          <CardTitle className={`text-${errorInfo.color}`}>
            {errorInfo.title}
          </CardTitle>
          {httpStatus && (
            <Badge
              variant="outline"
              className={`ml-auto border-${errorInfo.color}/20 text-${errorInfo.color}`}
            >
              {httpStatus}
            </Badge>
          )}
        </div>
        <CardDescription className={`text-${errorInfo.color}/70`}>
          {path
            ? `Error in: ${path}`
            : "An error occurred while loading this content"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className={`rounded-md bg-${errorInfo.bgColor} p-4`}>
          <p className={`text-${errorInfo.color} mb-2 font-medium`}>
            {detailedMessage}
          </p>

          <Collapsible
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            className="mt-3"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`text-${errorInfo.color}/70 hover:text-${errorInfo.color} text-xs`}
              >
                {detailsOpen ? "Hide details" : "Show details"}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <pre
                className={`text-xs text-${errorInfo.color}/80 mt-2 max-h-48 overflow-auto font-mono whitespace-pre-wrap bg-${errorInfo.color}/5 rounded-sm border p-3 border-${errorInfo.color}/10`}
              >
                Error Code: {errorCode}
                {httpStatus && `\nHTTP Status: ${httpStatus}`}
                {path && `\nPath: ${path}`}
                {error.stack && `\n\nStack Trace:\n${error.stack}`}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 flex justify-end gap-2 border-t px-6 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={resetErrorBoundary}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper function to get error information based on error code
function getErrorInfo(code: string | number) {
  switch (code) {
    case "UNAUTHORIZED":
    case 401:
      return {
        icon: <Shield className="h-5 w-5" />,
        title: "Authentication Error",
        color: "yellow-600",
        bgColor: "yellow-50",
      };
    case "FORBIDDEN":
    case 403:
      return {
        icon: <Shield className="h-5 w-5" />,
        title: "Access Denied",
        color: "red-600",
        bgColor: "red-50",
      };
    case "NOT_FOUND":
    case 404:
      return {
        icon: <Code className="h-5 w-5" />,
        title: "Resource Not Found",
        color: "blue-600",
        bgColor: "blue-50",
      };
    case "INTERNAL_SERVER_ERROR":
    case 500:
      return {
        icon: <Server className="h-5 w-5" />,
        title: "Server Error",
        color: "red-600",
        bgColor: "red-50",
      };
    default:
      return {
        icon: <AlertCircle className="h-5 w-5" />,
        title: "Something Went Wrong",
        color: "destructive",
        bgColor: "destructive/5",
      };
  }
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Optional: Reset application state here if needed
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
