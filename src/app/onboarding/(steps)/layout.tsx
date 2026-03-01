import React from "react";

export default function StepsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col font-heading">
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 pb-24 pt-4">
        {children}
      </div>
    </div>
  );
}
