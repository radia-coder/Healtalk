import { AuthProvider, UserRole, UserStatus } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      emailVerified?: Date | null;
      status?: UserStatus;
      authProvider?: AuthProvider;
      supabaseAuthId?: string | null;
    };
  }

  interface User extends DefaultUser {
    role: UserRole;
    emailVerified?: Date | null;
    status?: UserStatus;
    authProvider?: AuthProvider;
    supabaseAuthId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    emailVerified?: Date | null;
    image?: string | null;
    status?: UserStatus;
    authProvider?: AuthProvider;
    supabaseAuthId?: string | null;
  }
}
