import { NextResponse } from "next/server";
import { ZodSchema } from "zod";

export type ValidationResult<T> =
  | { data: T; error: null }
  | { data: null; error: NextResponse };

const buildError = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "flatten" in error &&
    typeof (error as { flatten: () => unknown }).flatten === "function"
  ) {
    return (error as { flatten: () => unknown }).flatten();
  }
  return null;
};

export const badRequest = (error: unknown) =>
  NextResponse.json(
    {
      error: "Invalid request",
      details: buildError(error),
    },
    { status: 400 }
  );

export async function parseJson<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);

  if (!result.success) {
    return { data: null, error: badRequest(result.error) };
  }

  return { data: result.data, error: null };
}

export function parseSearchParams<T>(
  request: Request,
  schema: ZodSchema<T>
): ValidationResult<T> {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    return { data: null, error: badRequest(result.error) };
  }

  return { data: result.data, error: null };
}
