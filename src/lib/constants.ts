// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Number of bcrypt salt rounds for password hashing (higher = slower = safer). */
export const BCRYPT_SALT_ROUNDS = 12;

/** Byte length for randomly generated tokens (email verify, password reset, CSRF). */
export const TOKEN_BYTE_LENGTH = 32;

// ─── Sessions & Appointments ──────────────────────────────────────────────────

/** Allowed session durations in minutes (60-min or 90-min slots). */
export const ALLOWED_SESSION_DURATIONS = [60, 90] as const;

/** Milliseconds per minute — use to convert minutes to ms. */
export const MINUTES_TO_MS = 60_000;

// ─── Cache ────────────────────────────────────────────────────────────────────

/** How long admin metrics are cached in-process before re-fetching from DB. */
export const ADMIN_CACHE_TTL_MS = 30_000; // 30 seconds

/** Max entries in the in-process server cache before stale keys are evicted. */
export const SERVER_CACHE_SIZE_LIMIT = 256;

// ─── Video Calls (Agora) ──────────────────────────────────────────────────────

/** Agora RTC token lifetime in seconds (1 hour). */
export const AGORA_TOKEN_TTL_SECONDS = 60 * 60;

// ─── AI Screening ─────────────────────────────────────────────────────────────

/** Number of user messages needed before the chatbot finalises the assessment. */
export const ASSESSMENT_QUESTION_THRESHOLD = 10;

/** Keywords that trigger an immediate crisis-response in the screening chatbot. */
export const CRISIS_KEYWORDS = [
  "crisis",
  "suicide",
  "self-harm",
  "end my life",
  "kill myself",
  "hurt myself",
] as const;

/** Emergency contact numbers shown to users in crisis. */
export const EMERGENCY_NUMBERS = {
  /** National Suicide & Crisis Lifeline (24/7, call or text). */
  crisis: "988",
  /** Crisis Text Line — text HOME to this number. */
  text: "741741",
  /** Standard emergency services. */
  emergency: "911",
} as const;

// ─── Rate Limits ──────────────────────────────────────────────────────────────

/** Default rate limit: regular API endpoints (requests per window). */
export const RATE_LIMIT_DEFAULT = 60;

/** Strict rate limit: sensitive endpoints like auth, screening chat. */
export const RATE_LIMIT_STRICT = 10;

/** High rate limit: frequently polled endpoints like conversations, metrics. */
export const RATE_LIMIT_HIGH = 120;
