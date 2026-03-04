type SupabaseConfig = {
  url: string;
  anonKey: string;
};

type SupabaseAdminConfig = {
  url: string;
  serviceRoleKey: string;
};

export type SupabaseAuthUser = {
  id: string;
  email: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: {
    name?: string;
    full_name?: string;
    [key: string]: unknown;
  } | null;
};

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  const padded = `${normalized}${"=".repeat(paddingLength)}`;
  return Buffer.from(padded, "base64").toString("utf8");
};

const getProjectUrlFromAccessToken = (accessToken: string): string | null => {
  const parts = accessToken.split(".");
  if (parts.length < 2) return null;

  try {
    const payloadRaw = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadRaw) as { iss?: unknown };
    if (typeof payload.iss !== "string" || !payload.iss.trim()) return null;

    return trimTrailingSlashes(
      payload.iss.replace(/\/auth\/v1\/?$/i, "").trim()
    );
  } catch {
    return null;
  }
};

const getSupabaseUrl = () =>
  process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const getSupabaseConfig = (): SupabaseConfig | null => {
  const rawUrl = getSupabaseUrl();
  const anonKey =
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!rawUrl || !anonKey) return null;
  return { url: trimTrailingSlashes(rawUrl), anonKey };
};

const getSupabaseAdminConfig = (): SupabaseAdminConfig | null => {
  const rawUrl = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!rawUrl || !serviceRoleKey) return null;
  return { url: trimTrailingSlashes(rawUrl), serviceRoleKey };
};

const withTimeout = async (input: RequestInfo | URL, init: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    return await fetch(input, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
};

export const isSupabaseAuthMigrationEnabled = () =>
  process.env.SUPABASE_AUTH_MIGRATION_ENABLED === "true";

export const verifySupabaseAccessToken = async (
  accessToken: string
): Promise<{ user: SupabaseAuthUser | null; error: string | null }> => {
  const config = getSupabaseConfig();
  if (!config) {
    return { user: null, error: "Supabase auth is not configured" };
  }

  const tokenProjectUrl = getProjectUrlFromAccessToken(accessToken);
  const urls = [tokenProjectUrl, config.url].filter(
    (value, index, arr): value is string => Boolean(value) && arr.indexOf(value) === index
  );

  for (const url of urls) {
    try {
      const response = await withTimeout(`${url}/auth/v1/user`, {
        method: "GET",
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json().catch(() => null)) as
        | SupabaseAuthUser
        | null;
      if (!payload?.id) {
        continue;
      }

      return { user: payload, error: null };
    } catch {
      // try next URL candidate
    }
  }

  return { user: null, error: "Invalid Supabase access token" };
};

export const signInSupabaseWithPassword = async (
  email: string,
  password: string
): Promise<{ accessToken: string | null; error: string | null }> => {
  const config = getSupabaseConfig();
  if (!config) {
    return { accessToken: null, error: "Supabase auth is not configured" };
  }

  try {
    const response = await withTimeout(
      `${config.url}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: config.anonKey,
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
          "Supabase password sign-in failed",
      };
    }

    return { accessToken: payload.access_token, error: null };
  } catch {
    return { accessToken: null, error: "Unable to connect to Supabase auth" };
  }
};

export const createSupabaseUserForMigration = async (options: {
  email: string;
  password: string;
  emailConfirmed: boolean;
}): Promise<{ userId: string | null; error: string | null }> => {
  const admin = getSupabaseAdminConfig();
  if (!admin) {
    return { userId: null, error: "Supabase admin is not configured" };
  }

  try {
    const response = await withTimeout(`${admin.url}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: admin.serviceRoleKey,
        Authorization: `Bearer ${admin.serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: options.email.trim().toLowerCase(),
        password: options.password,
        email_confirm: options.emailConfirmed,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; user?: { id?: string }; msg?: string; error?: string }
      | null;

    if (!response.ok) {
      const message =
        payload?.msg || payload?.error || "Failed to create Supabase user";
      return { userId: null, error: message };
    }

    const userId = payload?.user?.id || payload?.id || null;
    if (!userId) {
      return { userId: null, error: "Supabase user created but ID missing" };
    }

    return { userId, error: null };
  } catch {
    return { userId: null, error: "Unable to create Supabase user" };
  }
};

const updateSupabaseUser = async (
  supabaseAuthId: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean; error: string | null }> => {
  const admin = getSupabaseAdminConfig();
  if (!admin) {
    return { ok: false, error: "Supabase admin is not configured" };
  }

  try {
    const response = await withTimeout(
      `${admin.url}/auth/v1/admin/users/${encodeURIComponent(supabaseAuthId)}`,
      {
        method: "PUT",
        headers: {
          apikey: admin.serviceRoleKey,
          Authorization: `Bearer ${admin.serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { msg?: string; error?: string }
        | null;
      return {
        ok: false,
        error: payload?.msg || payload?.error || "Supabase user update failed",
      };
    }

    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "Unable to update Supabase user" };
  }
};

export const confirmSupabaseUserEmail = async (supabaseAuthId: string) =>
  updateSupabaseUser(supabaseAuthId, { email_confirm: true });

export const updateSupabaseUserPassword = async (
  supabaseAuthId: string,
  password: string
) => updateSupabaseUser(supabaseAuthId, { password });
