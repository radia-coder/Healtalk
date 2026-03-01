import React from "react";
import { SimpleHeader } from "@/components/ui/simple-header";

interface BlogPostLayoutProps {
  children: React.ReactNode;
}

export function BlogPostLayout({ children }: BlogPostLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F3EEE6] flex flex-col font-sans text-[#1a1a1a]">
      <SimpleHeader />
      
      <main className="flex-grow w-full pt-32 pb-0">
        {children}
      </main>
    </div>
  );
}
