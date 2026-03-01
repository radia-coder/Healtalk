"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

const getPostLoginPath = (role?: string) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "PSYCHOLOGIST") return "/psychologist/dashboard";
  return "/patient/dashboard";
};

export default function OAuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const resolveSession = async () => {
      const session = await getSession();
      if (!session?.user) {
        router.replace("/login?error=OAuthCallbackError");
        return;
      }

      const role = (session.user as { role?: string } | undefined)?.role;
      router.replace(getPostLoginPath(role));
    };

    resolveSession();
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
          Signing you in...
        </h1>
        <p className="text-gray-500 text-center text-[16px]">
          We&apos;re finishing your secure sign-in. This will only take a moment.
        </p>
      </div>
    </div>
  );
}
