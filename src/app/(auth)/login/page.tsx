"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import {
  isSupabaseGooglePreferred,
  isSupabasePasswordPreferred,
} from "@/lib/auth-cutover";
import {
  signInWithSupabasePassword,
  startSupabaseGoogleOAuth,
} from "@/lib/supabase-browser";

// Auth helpers
const authErrorMessages: Record<string, string> = {
  CredentialsSignin: "That email or password looks wrong.",
  AccessDenied: "Please verify your email before signing in.",
  OAuthAccountNotLinked: "This email is linked to a different sign-in method.",
  OAuthCallbackError: "Social sign-in failed. Please try again.",
  SupabaseSignin: "Supabase sign-in failed. Please check your credentials.",
};

type SearchParamsReader = {
  get: (name: string) => string | null;
};

const getPostLoginPath = (role?: string, redirectParam?: string | null) => {
  // If a safe relative redirect was requested (e.g. from onboarding), honour it.
  if (redirectParam && redirectParam.startsWith("/")) return redirectParam;
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "PSYCHOLOGIST") return "/psychologist/dashboard";
  return "/patient/dashboard";
};

const getAuthQueryFeedback = (searchParams: SearchParamsReader | null) => {
  if (!searchParams) {
    return { queryErrorMessage: null, querySuccessMessage: null };
  }

  const error = searchParams.get("error");
  const success = searchParams.get("success");

  const queryErrorMessage = error
    ? authErrorMessages[error] ?? "We could not sign you in. Please try again."
    : null;
  const querySuccessMessage =
    success === "verified"
      ? "Email verified. You can sign in now."
      : success === "password_updated"
      ? "Password updated. Please sign in with your new password."
      : null;

  return { queryErrorMessage, querySuccessMessage };
};

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [runtimeErrorMessage, setRuntimeErrorMessage] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  const { queryErrorMessage, querySuccessMessage } = useMemo(
    () => getAuthQueryFeedback(searchParams),
    [searchParams]
  );
  const errorMessage = runtimeErrorMessage ?? queryErrorMessage;
  const successMessage = querySuccessMessage;
  // Preserve the redirect destination set by the onboarding flow (or any other caller).
  const redirectAfterLogin = searchParams?.get("redirect") ?? null;

  const handleGoogleSignIn = async () => {
    if (isGoogleSubmitting) return;
    setIsGoogleSubmitting(true);
    if (isSupabaseGooglePreferred()) {
      const result = startSupabaseGoogleOAuth();
      if (result.ok) return;
      setRuntimeErrorMessage(result.error || authErrorMessages.OAuthCallbackError);
      setIsGoogleSubmitting(false);
      return;
    }

    await signIn("google", { callbackUrl: "/oauth-redirect" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !formData.email || !formData.password) return;
    
    setIsSubmitting(true);
    setRuntimeErrorMessage(null);

    let supabaseError: string | null = null;
    if (isSupabasePasswordPreferred()) {
      const supabaseSignIn = await signInWithSupabasePassword(
        formData.email,
        formData.password
      );

      if (supabaseSignIn.accessToken) {
        const result = await signIn("supabase-token", {
          redirect: false,
          accessToken: supabaseSignIn.accessToken,
        });

        if (result && !result.error) {
          const session = await getSession();
          const role = (session?.user as { role?: string } | undefined)?.role;
          router.push(getPostLoginPath(role, redirectAfterLogin));
          return;
        }

        supabaseError = authErrorMessages.SupabaseSignin;
      } else if (supabaseSignIn.error) {
        supabaseError = authErrorMessages.SupabaseSignin;
      }
    }

    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (!result || result.error) {
      setRuntimeErrorMessage(supabaseError || authErrorMessages.CredentialsSignin);
      setIsSubmitting(false);
      return;
    }

    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    router.push(getPostLoginPath(role, redirectAfterLogin));
  };

  const isFormValid = formData.email.trim().length > 0 && formData.password.trim().length > 0;

  return (
    <div className="flex flex-1 w-full items-center justify-center px-4 py-16 font-sans mb-16">
      {/* 
         Main Card Container 
         Size: 800px x 696px
         Bg: White
         Radius: Rounded large (approx 2.5rem based on screenshot? Using 2.5rem / 40px)
         Shadow: Soft
      */}
      <div className="w-[800px] h-[696px] bg-[#ebebff] rounded-[40px] shadow-sm flex flex-col items-center">
        
        {/* Top Area: Logo + Title */}
        <div className="mt-[56px] flex flex-col items-center">
          {/* Logo Mark + Text */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/New_Logo.png"
                alt="HealTalk logo"
                width={112}
                height={28}
                className="h-7 w-auto"
              />
            </Link>
          </div>

          <h1 className="text-[32px] font-bold text-[#111111] leading-tight">
            Welcome to HealTalk
          </h1>
        </div>

        {/* Form Container */}
        <div className="mt-[56px] w-[418px]">
          {errorMessage && (
            <div className="mb-4 text-center text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 text-center text-sm text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
              {successMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting}
            className={`w-full h-[57px] rounded-xl flex items-center justify-center font-medium text-[16px] transition-colors border border-gray-200
              ${isGoogleSubmitting
                ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                : "bg-white text-[#111] hover:bg-gray-50"
              }
            `}
          >
            {isGoogleSubmitting ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-[57px] bg-[#F5F5F5] border border-gray-200 rounded-xl px-4 text-[16px] text-[#111] placeholder-gray-400 outline-none focus:border-black focus:border-2 focus:ring-0 transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-[57px] bg-[#F5F5F5] border border-gray-200 rounded-xl px-4 pr-12 text-[16px] text-[#111] placeholder-gray-400 outline-none focus:border-black focus:border-2 focus:ring-0 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Links Row */}
            <div className="flex justify-between items-center mt-1 w-full text-[14px] font-medium text-[#111]">
              <Link href="/forgot-password" className="hover:underline opacity-80 hover:opacity-100">
                Forgot your password?
              </Link>
              <Link href="/signup" className="hover:underline opacity-80 hover:opacity-100">
                New here? Create an account
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`mt-14 w-full h-[57px] rounded-xl flex items-center justify-center font-medium text-[16px] transition-colors
                ${(!isFormValid || isSubmitting) 
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
                }
              `}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
