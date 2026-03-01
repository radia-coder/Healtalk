"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F8FF] px-6 text-center">
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Something went wrong</h1>
        <p className="text-gray-500">
          An unexpected error occurred. Please try again or refresh the page.
        </p>
        <Button className="bg-[#5B6CFF] hover:bg-[#4a5ae0]" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
