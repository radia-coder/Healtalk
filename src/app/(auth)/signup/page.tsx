"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { fetchCsrfToken } from "@/lib/client-security";
import { isSupabaseGooglePreferred } from "@/lib/auth-cutover";
import { startSupabaseGoogleOAuth } from "@/lib/supabase-browser";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const handleGoogleSignIn = async () => {
    if (isGoogleSubmitting) return;
    setIsGoogleSubmitting(true);
    if (isSupabaseGooglePreferred()) {
      const result = startSupabaseGoogleOAuth();
      if (result.ok) return;
      setErrorMessage(result.error || "Google sign-in failed. Please try again.");
      setIsGoogleSubmitting(false);
      return;
    }
    await signIn("google", { callbackUrl: "/oauth-redirect" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSuccessMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const csrfToken = await fetchCsrfToken();

    // Simplified registration logic matching the UI fields
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: "PATIENT", // Defaulting to Patient for this UI flow
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setErrorMessage(data?.error ?? "Failed to create account.");
      setIsSubmitting(false);
      return;
    }

    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setSuccessMessage(
      "Account created! Please check your email to verify your account before signing in."
    );
    setIsSubmitting(false);
  };

  const isFormValid = 
    formData.fullName.trim().length > 0 && 
    formData.email.trim().length > 0 && 
    formData.password.trim().length > 0 &&
    formData.confirmPassword.trim().length > 0;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F6F2EA] px-4 py-8 sm:py-12 font-sans">
      {/* 
         Main Card Container 
         Size: 800px x 696px
         Bg: White
         Radius: 40px
         Shadow: Soft
      */}
      <div className="w-full max-w-[800px] bg-[#ebebff] rounded-[28px] sm:rounded-[40px] shadow-sm flex flex-col items-center px-5 py-8 sm:px-8 sm:py-10">
        
        {/* Top Area: Logo + Title */}
        <div className="mt-2 sm:mt-4 flex flex-col items-center">
          {/* Logo Mark + Text */}
          <div className="flex items-center gap-2 mb-4">
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

          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111111] leading-tight mb-1 text-center">
            Create your HealTalk account
          </h1>
          <p className="text-[16px] text-gray-500 font-medium text-center">
            We’ll help you find the right therapist
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-8 sm:mt-10 w-full max-w-[418px]">
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
            {/* Full Name */}
            <div className="relative">
              <input
                type="text"
                placeholder="Full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-[57px] bg-[#F5F5F5] border border-gray-200 rounded-xl px-4 text-[16px] text-[#111] placeholder-gray-400 outline-none focus:border-black focus:border-2 focus:ring-0 transition-all"
                required
              />
            </div>

            {/* Email */}
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

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full h-[57px] bg-[#F5F5F5] border border-gray-200 rounded-xl px-4 pr-12 text-[16px] text-[#111] placeholder-gray-400 outline-none focus:border-black focus:border-2 focus:ring-0 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Links Row */}
            <div className="flex justify-between items-center mt-1 w-full text-[14px] font-medium text-[#111]">
              <span className="text-gray-500">Already have an account?</span>
              <Link href="/login" className="hover:underline opacity-80 hover:opacity-100">
                Sign in
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`mt-6 w-full h-[57px] rounded-xl flex items-center justify-center font-medium text-[16px] transition-colors
                ${(!isFormValid || isSubmitting) 
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
                }
              `}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
