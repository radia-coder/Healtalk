"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function DashboardError({
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-md space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard error</h2>
        <p className="text-gray-500">
          We couldn’t load this dashboard view. Please try again.
        </p>
        <Button className="bg-[#5B6CFF] hover:bg-[#4a5ae0]" onClick={reset}>
          Reload
        </Button>
      </div>
    </div>
  );
}
