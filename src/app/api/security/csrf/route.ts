import { ensureCsrfCookie } from "@/lib/csrf";

export async function GET() {
  return ensureCsrfCookie();
}
