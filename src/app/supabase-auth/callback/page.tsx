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

      const session = await getSession();
      const role = (session?.user as { role?: string } | undefined)?.role;
      router.replace(getPostLoginPath(role));
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex flex-1 w-full items-center justify-center px-4 py-16 font-sans mb-16">
      <div className="w-[800px] bg-[#ebebff] rounded-[40px] shadow-sm flex flex-col items-center py-16">
        <Link href="/" className="mb-6">
          <Image
            src="/images/New_Logo.png"
            alt="HealTalk"
            width={112}
            height={28}
            className="h-7 w-auto"
          />
        </Link>
        <h1 className="text-[28px] font-bold text-[#111] mb-3 text-center">
          Completing Supabase sign-in...
        </h1>
        <p className="text-gray-500 text-center text-[16px]">
          We are securely finishing your login.
        </p>
      </div>
    </div>
  );
}
