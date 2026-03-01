"use client";

export default function OnboardingRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col font-heading">
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
