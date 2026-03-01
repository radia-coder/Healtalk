"use client";

export default function OnboardingRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F2EA] font-heading text-[#121E0D]">
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
