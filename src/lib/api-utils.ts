import { NextResponse } from "next/server";
import { MINUTES_TO_MS } from "@/lib/constants";

/**
 * Calculates how many minutes apart two dates are.
 * Used to verify that a session's duration matches its start/end times.
 */
export function calculateDurationMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / MINUTES_TO_MS);
}

/**
 * Parses a date string and returns a Date, or null if the string is invalid.
 * Centralised here so every route uses the same safe parsing logic.
 */
export function parseDate(dateStr: string): Date | null {
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Standard 401 response for unauthenticated requests.
 * Use this instead of writing NextResponse.json({ error: "Unauthorized" }) everywhere.
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Standard 400 response for bad request payloads.
 * Pass a human-readable message explaining what was wrong.
 */
export function badRequestResponse(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}
