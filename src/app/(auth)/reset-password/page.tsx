"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !token) return;

    if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: "Passwords do not match." });
        return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: formData.password }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "Password updated successfully! Redirecting..." });
        setTimeout(() => {
            router.push("/login?success=password_updated");
        }, 2000);
      } else {
        const data = await res.json().catch(() => null);
        setMessage({ type: 'error', text: data?.error || "Token is invalid or expired." });
      }
    } catch {
      setMessage({ type: 'error', text: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#F6F2EA] px-4 py-8 sm:py-12 font-sans">
            <div className="w-full max-w-[800px] min-h-40 flex items-center justify-center bg-[#ebebff] rounded-[28px] sm:rounded-[40px] text-gray-500 px-5">
                Invalid link.
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F6F2EA] px-4 py-8 sm:py-12 font-sans">
      <div className="w-full max-w-[800px] bg-[#ebebff] rounded-[28px] sm:rounded-[40px] shadow-sm flex flex-col items-center px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col items-center w-full max-w-[418px]">
          <Link href="/" className="mb-6">
            <Image
              src="/images/New_Logo.png"
              alt="HealTalk"
              width={112}
              height={28}
              className="h-7 w-auto"
            />
          </Link>

          <h1 className="text-[32px] font-bold text-[#111] mb-8 text-center">Set New Password</h1>

          {message && (
             <div className={`w-full p-4 mb-6 rounded-xl text-center text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[16px]">
             {/* Password */}
             <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
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
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full h-[57px] bg-[#F5F5F5] border border-gray-200 rounded-xl px-4 text-[16px] text-[#111] placeholder-gray-400 outline-none focus:border-black focus:border-2 focus:ring-0 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.password}
              className={`mt-6 w-full h-[57px] rounded-xl flex items-center justify-center font-medium text-[16px] transition-colors
                ${isSubmitting || !formData.password 
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
                }
              `}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EA] flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
