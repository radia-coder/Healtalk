# Phase 10 Plan 2: Rate Limiting Summary

**Rate limiting added for auth, admin, messaging, and appointment endpoints.**

## Accomplishments

- Installed Upstash rate limiting dependencies
- Added shared rate limit helper with safe fallback when env is missing
- Applied limits to auth routes, admin APIs, messaging, and appointments
- Documented Upstash env variables in `.env.example`

## Files Created/Modified

- `package.json`
- `package-lock.json`
- `.env.example`
- `src/lib/rate-limit.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/appointments/route.ts`
- `src/app/api/appointments/[id]/route.ts`
- `src/app/api/messages/[appointmentId]/route.ts`
- `src/app/api/admin/metrics/route.ts`
- `src/app/api/admin/analytics/route.ts`
- `src/app/api/admin/activity/route.ts`
- `src/app/api/admin/hospitals/route.ts`
- `src/app/api/admin/psychologists/route.ts`
- `src/app/api/admin/psychologists/[id]/route.ts`
- `src/app/api/admin/reviews/route.ts`
- `src/app/api/admin/reviews/[id]/route.ts`
- `src/app/api/admin/blog-posts/route.ts`
- `src/app/api/admin/blog-posts/[id]/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`

## Behavior

- Excessive requests now return 429 with Retry-After header
- If Upstash env vars are missing, routes run without rate limits (dev-friendly)

## Next Step

Proceed to **10-03-PLAN.md** for security headers and CSRF protection.
