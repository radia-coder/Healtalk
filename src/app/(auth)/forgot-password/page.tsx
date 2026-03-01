"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: "If an account exists, we sent a reset link to your email."
        });
        setEmail(""); // Clear input
      } else {
         const data = await res.json().catch(() => null);
         // Even on error, usually safest to show generic message for security, 
         // but requirement says "Show success message". 
         // I'll show generic success for security unless it's a critical error.
         setMessage({
            type: 'error',
            text: data?.error || "Something went wrong. Please try again."
         });
      }
    } catch {
      setMessage({ type: 'error', text: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F6F2EA] px-4 py-8 sm:py-12 font-sans">
      <div className="w-full max-w-[800px] bg-[#ebebff] rounded-[28px] sm:rounded-[40px] shadow-sm flex flex-col items-center px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col items-center w-full max-w-[418px]">
          {/* Logo */}
          <Link href="/" className="mb-6">
            <Image
              src="/images/New_Logo.png"
              alt="HealTalk"
              width={112}
              height={28}
              className="h-7 w-auto"
            />
          </Link>

          <h1 className="text-[32px] font-bold text-[#111] mb-2 text-center">Reset Password</h1>
          <p className="text-gray-500 mb-8 text-center text-[16px]">
            Enter your email to receive a password reset link.
          </p>

          {message && (
            <div className={`w-full p-4 mb-6 rounded-xl text-center text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[16px]">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[57px] bg-[#F5F5F5] border border-gray-200 rounded-xl px-4 text-[16px] text-[#111] placeholder-gray-400 outline-none focus:border-black focus:border-2 focus:ring-0 transition-all"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-6 w-full h-[57px] rounded-xl flex items-center justify-center font-medium text-[16px] transition-colors
                ${isSubmitting || !email
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
                }
              `}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <Link href="/login" className="mt-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
