import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAuditLog } from "@/lib/audit";
import {
  createSupabaseUserForMigration,
  isSupabaseAuthMigrationEnabled,
  signInSupabaseWithPassword,
  verifySupabaseAccessToken,
} from "@/lib/supabase-auth";
import { BCRYPT_SALT_ROUNDS } from "@/lib/constants";

const normalizeEmail = (value?: string | null) =>
  value?.trim().toLowerCase();

const linkPasswordUserToSupabase = async (options: {
  userId: string;
  email: string;
  password: string;
  emailVerified: Date | null;
  authProvider: "NEXTAUTH" | "SUPABASE" | "HYBRID";
  supabaseAuthId: string | null;
}) => {
  if (!isSupabaseAuthMigrationEnabled() || options.supabaseAuthId) return;

  try {
    let resolvedSupabaseAuthId: string | null = null;
    let syncError: string | null = null;

    const createResult = await createSupabaseUserForMigration({
      email: options.email,
      password: options.password,
      emailConfirmed: Boolean(options.emailVerified),
    });

    if (createResult.userId) {
      resolvedSupabaseAuthId = createResult.userId;
    } else {
      syncError = createResult.error;

      const signInResult = await signInSupabaseWithPassword(
        options.email,
        options.password
      );
      if (signInResult.accessToken) {
        const verification = await verifySupabaseAccessToken(
          signInResult.accessToken
        );
        resolvedSupabaseAuthId = verification.user?.id || null;
        if (!resolvedSupabaseAuthId && verification.error) {
          syncError = verification.error;
        }
      } else if (signInResult.error) {
        syncError = signInResult.error;
      }
    }

    if (!resolvedSupabaseAuthId) {
      if (syncError) {
        console.warn(
          `Supabase link skipped for ${options.email}: ${syncError}`
        );
      }
      return;
    }

    const existingOwner = await prisma.user.findUnique({
      where: { supabaseAuthId: resolvedSupabaseAuthId },
      select: { id: true },
    });
    if (existingOwner && existingOwner.id !== options.userId) {
      console.warn(
        `Supabase link skipped for ${options.email}: Supabase ID already linked to another user`
      );
      return;
    }

    const updateData: Prisma.UserUpdateInput = {
      supabaseAuthId: resolvedSupabaseAuthId,
      supabaseLinkedAt: new Date(),
    };
    if (options.authProvider === "NEXTAUTH") {
      updateData.authProvider = "HYBRID";
    }

    await prisma.user.update({
      where: { id: options.userId },
      data: updateData,
    });
  } catch (error) {
    console.warn(
      `Supabase link skipped for ${options.email}: unexpected migration error`,
      error
    );
  }
};

type BootstrapRole = "PSYCHOLOGIST" | "PATIENT" | "ADMIN";
type BootstrapUser = {
  role: BootstrapRole;
  name: string;
  email: string;
  password: string;
};

// Bootstrap users are opt-in and only available outside production.
const ENABLE_BOOTSTRAP =
  process.env.NODE_ENV !== "production" &&
  process.env.ENABLE_BOOTSTRAP_USERS === "true";

const bootstrapUsers: BootstrapUser[] = ENABLE_BOOTSTRAP
  ? [
      {
        role: "PSYCHOLOGIST" as const,
        name: "Dr. Ahmet Yılmaz",
        email: normalizeEmail(process.env.PSYCHOLOGIST_EMAIL),
        password: process.env.PSYCHOLOGIST_PASSWORD,
      },
      {
        role: "PATIENT" as const,
        name: "John Doe",
        email: normalizeEmail(process.env.PATIENT_EMAIL),
        password: process.env.PATIENT_PASSWORD,
      },
      {
        role: "ADMIN" as const,
        name: "Admin User",
        email: normalizeEmail(process.env.ADMIN_EMAIL),
        password: process.env.ADMIN_PASSWORD,
      },
    ]
      .filter(
        (user): user is BootstrapUser =>
          Boolean(user.email && user.password)
      )
  : [];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const email = credentials.email.trim().toLowerCase();

        const bootstrapMatch = bootstrapUsers.find(
          (user) => user.email === email
        );

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          if (user.password) {
            const isCorrectPassword = await bcrypt.compare(
              credentials.password,
              user.password
            );

            if (isCorrectPassword) {
              const shouldAutoVerify =
                bootstrapMatch &&
                credentials.password === bootstrapMatch.password &&
                !user.emailVerified;

              if (shouldAutoVerify) {
                const verifiedUser = await prisma.user.update({
                  where: { id: user.id },
                  data: { emailVerified: new Date() },
                });

                await linkPasswordUserToSupabase({
                  userId: verifiedUser.id,
                  email: verifiedUser.email,
                  password: credentials.password,
                  emailVerified: verifiedUser.emailVerified,
                  authProvider: verifiedUser.authProvider,
                  supabaseAuthId: verifiedUser.supabaseAuthId,
                });

                return verifiedUser;
              }

              await linkPasswordUserToSupabase({
                userId: user.id,
                email: user.email,
                password: credentials.password,
                emailVerified: user.emailVerified,
                authProvider: user.authProvider,
                supabaseAuthId: user.supabaseAuthId,
              });

              return user;
            }
          }

          if (
            bootstrapMatch &&
            credentials.password === bootstrapMatch.password
          ) {
            const hashedPassword = await bcrypt.hash(bootstrapMatch.password, BCRYPT_SALT_ROUNDS);

            const updatedUser = await prisma.user.update({
              where: { id: user.id },
              data: {
                password: hashedPassword,
                role: bootstrapMatch.role,
                emailVerified: new Date(),
              },
            });

            await linkPasswordUserToSupabase({
              userId: updatedUser.id,
              email: updatedUser.email,
              password: credentials.password,
              emailVerified: updatedUser.emailVerified,
              authProvider: updatedUser.authProvider,
              supabaseAuthId: updatedUser.supabaseAuthId,
            });

            return updatedUser;
          }

          throw new Error("Invalid credentials");
        }

        if (
          bootstrapMatch &&
          credentials.password === bootstrapMatch.password
        ) {
          const hashedPassword = await bcrypt.hash(bootstrapMatch.password, BCRYPT_SALT_ROUNDS);

          const createdUser = await prisma.user.create({
            data: {
              name: bootstrapMatch.name,
              email,
              password: hashedPassword,
              role: bootstrapMatch.role,
              emailVerified: new Date(),
              patient:
                bootstrapMatch.role === "PATIENT" ? { create: {} } : undefined,
              admin:
                bootstrapMatch.role === "ADMIN" ? { create: {} } : undefined,
              psychologist:
                bootstrapMatch.role === "PSYCHOLOGIST"
                  ? {
                      create: {
                        credentials: "PhD, Clinical Psychologist",
                        licenseNumber: `LICENSE-${email}`,
                        experience: 10,
                        bio: "Licensed clinical psychologist with experience in evidence-based care.",
                        specializations: ["Anxiety Disorders", "Depression"],
                        price60: 45000,
                        price90: 65000,
                        status: "APPROVED",
                        approvedAt: new Date(),
                      },
                    }
                  : undefined,
            },
          });

          await linkPasswordUserToSupabase({
            userId: createdUser.id,
            email: createdUser.email,
            password: credentials.password,
            emailVerified: createdUser.emailVerified,
            authProvider: createdUser.authProvider,
            supabaseAuthId: createdUser.supabaseAuthId,
          });

          return createdUser;
        }

        throw new Error("Invalid credentials");
      },
    }),
    CredentialsProvider({
      id: "supabase-token",
      name: "supabase-token",
      credentials: {
        accessToken: { label: "Supabase access token", type: "text" },
      },
      async authorize(credentials) {
        if (!isSupabaseAuthMigrationEnabled()) {
          throw new Error("Supabase auth migration is disabled");
        }

        const accessToken = credentials?.accessToken?.trim();
        if (!accessToken) {
          throw new Error("Invalid credentials");
        }

        const verification = await verifySupabaseAccessToken(accessToken);
        if (verification.error || !verification.user?.id) {
          throw new Error("Invalid credentials");
        }

        const supabaseUser = verification.user;
        const email = normalizeEmail(supabaseUser.email);
        if (!email) {
          throw new Error("Supabase account is missing email");
        }

        let user = await prisma.user.findFirst({
          where: {
            OR: [{ supabaseAuthId: supabaseUser.id }, { email }],
          },
          include: { patient: true, psychologist: true, admin: true },
        });

        if (!user) {
          const guessedName =
            supabaseUser.user_metadata?.full_name?.trim() ||
            supabaseUser.user_metadata?.name?.trim() ||
            email.split("@")[0] ||
            "HealTalk User";

          user = await prisma.user.create({
            data: {
              name: guessedName,
              email,
              role: "PATIENT",
              emailVerified: supabaseUser.email_confirmed_at
                ? new Date(supabaseUser.email_confirmed_at)
                : new Date(),
              authProvider: "SUPABASE",
              supabaseAuthId: supabaseUser.id,
              supabaseLinkedAt: new Date(),
              patient: { create: {} },
            },
            include: { patient: true, psychologist: true, admin: true },
          });
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Account disabled");
        }

        const updateData: Prisma.UserUpdateInput = {};
        if (!user.supabaseAuthId) {
          updateData.supabaseAuthId = supabaseUser.id;
          updateData.supabaseLinkedAt = new Date();
        }

        if (user.authProvider === "NEXTAUTH") {
          updateData.authProvider = "HYBRID";
        }

        if (
          user.authProvider === "SUPABASE" &&
          !user.supabaseAuthId
        ) {
          updateData.authProvider = "HYBRID";
        }

        if (!user.emailVerified && supabaseUser.email_confirmed_at) {
          updateData.emailVerified = new Date(supabaseUser.email_confirmed_at);
        }

        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            include: { patient: true, psychologist: true, admin: true },
          });
        }

        if (!user.patient && !user.psychologist && !user.admin) {
          await prisma.patient.create({ data: { userId: user.id } });
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: "PATIENT" },
            include: { patient: true, psychologist: true, admin: true },
          });
        }

        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (user?.id) {
        const statusCheck = await prisma.user.findUnique({
          where: { id: user.id },
          select: { status: true },
        });

        if (statusCheck?.status && statusCheck.status !== "ACTIVE") {
          return false;
        }
      }

      if (account?.provider === "credentials") {
        if (!user?.emailVerified) {
          return false;
        }
      }

      // Handle Google OAuth - auto-verify email and create Patient profile
      if (account?.provider === "google" && user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { patient: true, psychologist: true, admin: true },
        });

        if (dbUser) {
          // Auto-verify email for Google OAuth users
          if (!dbUser.emailVerified) {
            await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() },
            });
          }

          // Create Patient profile if user has no role-specific profile
          if (!dbUser.patient && !dbUser.psychologist && !dbUser.admin) {
            await prisma.patient.create({
              data: { userId: user.id },
            });

            // Update user role to PATIENT
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "PATIENT" },
            });
          }
        }
      }

      if (user?.id) {
        await createAuditLog({
          actorId: user.id,
          action: "AUTH_LOGIN",
          targetType: "User",
          targetId: user.id,
          metadata: { provider: account?.provider ?? "unknown" },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        const dbUserById = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            role: true,
            emailVerified: true,
            image: true,
            status: true,
            authProvider: true,
            supabaseAuthId: true,
          },
        });

        if (dbUserById) {
          token.role = dbUserById.role;
          token.emailVerified = dbUserById.emailVerified;
          token.image = dbUserById.image ?? token.image ?? null;
          token.status = dbUserById.status ?? token.status ?? "ACTIVE";
          token.authProvider = dbUserById.authProvider ?? token.authProvider;
          token.supabaseAuthId =
            dbUserById.supabaseAuthId ?? token.supabaseAuthId ?? null;
        } else {
          token.image = user.image ?? token.image ?? null;
        }
      }

      if ((!token.role || !token.id) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
            emailVerified: true,
            image: true,
            status: true,
            authProvider: true,
            supabaseAuthId: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified;
          token.image = dbUser.image ?? token.image ?? null;
          token.status = dbUser.status ?? token.status ?? "ACTIVE";
          token.authProvider = dbUser.authProvider ?? token.authProvider;
          token.supabaseAuthId =
            dbUser.supabaseAuthId ?? token.supabaseAuthId ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && !token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
            emailVerified: true,
            image: true,
            status: true,
            authProvider: true,
            supabaseAuthId: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified;
          token.image = dbUser.image ?? token.image ?? null;
          token.status = dbUser.status ?? token.status ?? "ACTIVE";
          token.authProvider = dbUser.authProvider ?? token.authProvider;
          token.supabaseAuthId =
            dbUser.supabaseAuthId ?? token.supabaseAuthId ?? null;
        }
      }

      if (session.user) {
        if (token.id) session.user.id = token.id;
        if (token.role) session.user.role = token.role;
        session.user.emailVerified = token.emailVerified ?? null;
        session.user.status = token.status ?? "ACTIVE";
        session.user.authProvider = token.authProvider;
        session.user.supabaseAuthId = token.supabaseAuthId ?? null;
        if (token.image !== undefined) {
          session.user.image = token.image;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
