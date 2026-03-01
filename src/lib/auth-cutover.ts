export type AuthCutoverMode = "nextauth" | "hybrid" | "supabase_first";

const normalizeMode = (value?: string | null): AuthCutoverMode => {
  const mode = value?.trim().toLowerCase();
  if (mode === "supabase_first") return "supabase_first";
  if (mode === "hybrid") return "hybrid";
  return "nextauth";
};

export const getAuthCutoverMode = (): AuthCutoverMode =>
  normalizeMode(
    process.env.NEXT_PUBLIC_AUTH_CUTOVER_MODE || process.env.AUTH_CUTOVER_MODE
  );

export const isSupabasePasswordPreferred = () => {
  const mode = getAuthCutoverMode();
  return mode === "supabase_first" || mode === "hybrid";
};

export const isSupabaseGooglePreferred = () => {
  const mode = getAuthCutoverMode();
  return mode === "supabase_first";
};
