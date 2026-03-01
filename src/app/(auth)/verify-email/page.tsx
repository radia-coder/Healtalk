"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type VerificationState = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || null;
  const hasValidToken = Boolean(token);

  const [state, setState] = useState<VerificationState>(
    hasValidToken ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    hasValidToken
      ? "Verifying your email..."
      : "Verification link is missing a token."
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`
        );
        if (res.ok) {
          setState("success");
          setMessage("Your email is verified. You can sign in now.");
        } else {
          const data = await res.json().catch(() => null);
          setState("error");
          setMessage(data?.error || "Verification link is invalid or expired.");
        }
      } catch {
        setState("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F6F2EA] px-4 py-8 sm:py-12 font-sans">
      <div className="w-full max-w-[800px] bg-[#ebebff] rounded-[28px] sm:rounded-[40px] shadow-sm flex flex-col items-center px-5 py-8 sm:px-8 sm:py-10">
        <Link href="/" className="mb-6">
          <Image
            src="/images/New_Logo.png"
            alt="HealTalk"
            width={112}
            height={28}
            className="h-7 w-auto"
          />
        </Link>

        <h1 className="text-[32px] font-bold text-[#111] mb-4 text-center">
          Email Verification
        </h1>

        <div
          className={`w-full max-w-[418px] p-4 rounded-xl text-center text-sm border ${
            state === "success"
              ? "bg-green-50 text-green-700 border-green-100"
              : state === "error"
              ? "bg-red-50 text-red-700 border-red-100"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          {message}
        </div>

        {state === "success" && (
          <Link
            href="/login?success=verified"
            className="mt-6 inline-flex h-[50px] items-center justify-center rounded-xl bg-black px-6 text-white text-[16px] font-medium hover:bg-gray-800 transition-colors"
          >
            Go to Sign In
          </Link>
        )}

        {state === "error" && (
          <Link
            href="/signup"
            className="mt-6 text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Create a new account
          </Link>
        )}
      </div>
    </div>
  );
}


export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EA] flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
