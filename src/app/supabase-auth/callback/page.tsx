"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";

const getPostLoginPath = (role?: string) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "PSYCHOLOGIST") return "/psychologist/dashboard";
  return "/patient/dashboard";
};

export default function SupabaseAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = params.get("access_token");
      const errorDescription =
        params.get("error_description") || params.get("error");

      if (!accessToken) {
        router.replace(`/login?error=${encodeURIComponent(errorDescription || "OAuthCallbackError")}`);
        return;
      }

      const result = await signIn("supabase-token", {
        redirect: false,
        accessToken,
      });

      if (!result || result.error) {
        router.replace("/login?error=OAuthCallbackError");
        return;
      }

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const session = await getSession();
        const role = (session?.user as { role?: string } | undefined)?.role;
        if (role) {
          router.replace(getPostLoginPath(role));
          return;
        }

        if (attempt < 4) {
          await wait(250);
        }
      }

      router.replace("/login?error=OAuthCallbackError");
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex flex-1 w-full items-center justify-center px-4 py-10 sm:py-16 font-sans bg-[#F6F2EA] min-h-screen">
      <div className="w-full max-w-[800px] bg-[#ebebff] rounded-[28px] sm:rounded-[40px] shadow-sm flex flex-col items-center px-5 py-10 sm:px-8 sm:py-16">
        <Link href="/" className="mb-6">
          <Image
            src="/images/New_Logo.png"
            alt="HealTalk"
            width={112}
            height={28}
            className="h-7 w-auto"
          />
        </Link>
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#111] mb-3 text-center">
          Completing sign-in...
        </h1>
        <p className="text-gray-500 text-center text-[16px]">
          We are securely finishing your login.
        </p>
      </div>
    </div>
  );
}
