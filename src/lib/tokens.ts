import crypto from "crypto";
import { TOKEN_BYTE_LENGTH } from "@/lib/constants";

export type TokenPurpose = "verify" | "reset";

/** Creates a cryptographically random token with a purpose prefix (e.g. "verify_abc123"). */
export const createToken = (purpose: TokenPurpose) =>
  `${purpose}_${crypto.randomBytes(TOKEN_BYTE_LENGTH).toString("hex")}`;

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const buildIdentifier = (email: string, purpose: TokenPurpose) =>
  `${email}:${purpose}`;

export const parseIdentifier = (identifier: string) => {
  const [email, purpose] = identifier.split(":");
  return {
    email,
    purpose: purpose as TokenPurpose | undefined,
  };
};
