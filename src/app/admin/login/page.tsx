"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  isSupabasePasswordPreferred,
} from "@/lib/auth-cutover";
import { signInWithSupabasePassword } from "@/lib/supabase-browser";

const authErrorMessages: Record<string, string> = {
  CredentialsSignin: "Incorrect email or password.",
  AccessDenied: "Access denied. Please verify your email first.",
  OAuthAccountNotLinked: "This email is linked to a different sign-in method.",
  OAuthCallbackError: "Sign-in failed. Please try again.",
  SupabaseSignin: "Sign-in failed. Please check your credentials.",
};

type SearchParamsReader = {
  get: (name: string) => string | null;
};

const getAdminQueryErrorMessage = (searchParams: SearchParamsReader | null) => {
  if (!searchParams) return null;
  const errorKey = searchParams.get("error");
  if (!errorKey) return null;
  return (
    authErrorMessages[errorKey] ?? "We could not sign you in. Please try again."
  );
};

const getSessionRole = async () => {
  const session = await getSession();
  return (session?.user as { role?: string } | undefined)?.role;
};

function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryError = useMemo(
    () => getAdminQueryErrorMessage(searchParams),
    [searchParams]
  );
  const errorMessage = runtimeError ?? queryError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !email || !password) return;

    setIsSubmitting(true);
    setRuntimeError(null);

    let supabaseError: string | null = null;
    if (isSupabasePasswordPreferred()) {
      const supabaseSignIn = await signInWithSupabasePassword(email, password);
      if (supabaseSignIn.accessToken) {
        const result = await signIn("supabase-token", {
          redirect: false,
          accessToken: supabaseSignIn.accessToken,
        });
        if (result && !result.error) {
          const role = await getSessionRole();
          if (role === "ADMIN") {
            router.push("/admin/dashboard");
            return;
          }
        }
        supabaseError = authErrorMessages.SupabaseSignin;
      } else if (supabaseSignIn.error) {
        supabaseError = authErrorMessages.SupabaseSignin;
      }
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result || result.error) {
      setRuntimeError(supabaseError || authErrorMessages.CredentialsSignin);
      setIsSubmitting(false);
      return;
    }

    const role = await getSessionRole();

    if (role !== "ADMIN") {
      setRuntimeError("This login is for administrators only.");
      await signIn("credentials", { redirect: false }); // sign out
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-gray-400 mt-2">Sign in to manage your content</p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
