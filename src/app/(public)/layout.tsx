import { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import AppFooter from "@/components/layout/AppFooter";
import { FloatingChatbot } from "@/components/chatbot/FloatingChatbot";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <AppFooter />
      <FloatingChatbot />
    </div>
  );
}
