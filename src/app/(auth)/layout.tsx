import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center relative">
        {/* Background image can go here if needed to match homepage, or be on specific pages */}
        {children}
    </div>
  );
}
