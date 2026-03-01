export const fetchCsrfToken = async (): Promise<string | null> => {
  const response = await fetch("/api/security/csrf", {
    credentials: "include",
  });
  if (!response.ok) return null;
  const data = (await response.json().catch(() => null)) as
    | { csrfToken?: string }
    | null;
  return data?.csrfToken || null;
};
