type SupabasePublicConfig = {
  url: string;
  key: string;
};

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const getSupabasePublicConfig = (): SupabasePublicConfig | null => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!rawUrl || !key) return null;
  return { url: trimTrailingSlashes(rawUrl), key };
};

export const isSupabaseBrowserConfigured = () =>
  Boolean(getSupabasePublicConfig());

export const signInWithSupabasePassword = async (
  email: string,
  password: string
): Promise<{ accessToken: string | null; error: string | null }> => {
  const config = getSupabasePublicConfig();
  if (!config) {
    return { accessToken: null, error: "Supabase is not configured" };
  }

  try {
    const response = await fetch(
      `${config.url}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: config.key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      }
    );

    const payload = (await response.json().catch(() => null)) as
      | {
          access_token?: string;
          error_description?: string;
          msg?: string;
        }
      | null;

    if (!response.ok || !payload?.access_token) {
      return {
        accessToken: null,
        error:
          payload?.error_description ||
          payload?.msg ||
          "Supabase sign-in failed",
      };
    }

    return { accessToken: payload.access_token, error: null };
  } catch {
    return { accessToken: null, error: "Unable to connect to Supabase auth" };
  }
};

export const startSupabaseGoogleOAuth = (): { ok: boolean; error?: string } => {
  const config = getSupabasePublicConfig();
  if (!config) {
    return { ok: false, error: "Supabase is not configured" };
  }

  if (typeof window === "undefined") {
    return { ok: false, error: "OAuth flow can only run in browser" };
  }

  const redirectTo = `${window.location.origin}/supabase-auth/callback`;
  const authorizeUrl = `${config.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
    redirectTo
  )}`;
  window.location.assign(authorizeUrl);
  return { ok: true };
};
