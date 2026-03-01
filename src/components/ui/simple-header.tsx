"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MenuToggle } from "@/components/ui/menu-toggle";
import { cn } from "@/lib/utils";

export function SimpleHeader() {
  const [open, setOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { data: session, status } = useSession();
  
  // Resources Mega Menu State
  const [isResourcesOpen, setIsResourcesOpen] = React.useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = React.useState<number | null>(null);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const resourcesLinkRef = React.useRef<HTMLButtonElement | null>(null);
  const resourcesMenuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mega menu on ESC
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsResourcesOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Close mega menu on route change (prevents "stuck open" state)
  React.useEffect(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsResourcesOpen(false);
    setHoveredCardIndex(null);
  }, [pathname]);

  const isHoverCapable = (e?: React.PointerEvent) => {
    if (e && e.pointerType !== "mouse") return false;
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  };

  const handleResourcesEnter = (e?: React.PointerEvent) => {
    if (!isHoverCapable(e)) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsResourcesOpen(true);
  };

  const handleResourcesLeave = (e?: React.PointerEvent) => {
    if (!isHoverCapable(e)) return;
    closeTimeoutRef.current = setTimeout(() => {
      setIsResourcesOpen(false);
      setHoveredCardIndex(null);
    }, 150);
  };

  const links: Array<{
    label: string;
    href: string;
    isMegaMenu?: boolean;
  }> = [
    { label: "Home", href: "/" },
    { label: "Find Psychologists", href: "/find-psychologists" },
    { label: "Resources", href: "/resources", isMegaMenu: true },
    { label: "About", href: "/about" },
  ];

  const isAuthenticated = status === "authenticated";
  const role = (session?.user as { role?: string } | undefined)?.role;
  const dashboardHref = role === "ADMIN"
    ? "/admin/dashboard"
    : role === "PSYCHOLOGIST"
      ? "/psychologist/dashboard"
      : "/patient/dashboard";

  const resourcesCards = [
    { title: "Blog", subtitle: "Practical tips and insider info.", href: "/resources/blog" },
    { title: "Podcasts", subtitle: "Insights from TA leaders.", href: "/resources/podcasts" },
  ];

  return (
    <>
      {/* Background Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-[9990] transition-opacity duration-300 pointer-events-none bg-[#f5f1e9]/35 backdrop-blur-[12px]",
          isResourcesOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
        )}
        onClick={() => setIsResourcesOpen(false)}
        aria-hidden="true"
      />


      {/* Mega Dropdown */}
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2 top-[112px] z-[9991] w-full max-w-[1200px] transition-all duration-300 ease-out origin-top px-4",
          isResourcesOpen 
            ? "opacity-100 translate-y-0 visible scale-100 pointer-events-auto" 
            : "opacity-0 -translate-y-4 invisible scale-95 pointer-events-none"
        )}
        ref={resourcesMenuRef}
        onPointerEnter={handleResourcesEnter}
        onPointerLeave={(e) => {
          handleResourcesLeave(e);
        }}
      >
          <div className="flex flex-row justify-center gap-3 w-full h-[355px]">
             {resourcesCards.map((card, index) => (
               <Link 
                 key={card.title} 
                 href={card.href} 
                 onClick={() => setIsResourcesOpen(false)} 
                 className={cn(
                    "group relative block h-full rounded-[22px] border border-[#E8E6E1] overflow-hidden transition-all duration-500 ease-out",
                    hoveredCardIndex === index ? "flex-[2] bg-[#D8D4FE] border-[#C4C0F0]" : "flex-1 bg-white hover:bg-slate-50"
                 )}
                 onMouseEnter={() => setHoveredCardIndex(index)}
               >
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 p-4 transition-all duration-500">
                    <h2 className={cn(
                        "leading-tight font-display text-[#1a1a1a] tracking-tight transition-all duration-500",
                        hoveredCardIndex === index ? "text-[48px]" : "text-[32px] opacity-80"
                    )}>{card.title}</h2>
                    <p className={cn(
                        "text-[#1a1a1a] font-sans font-medium transition-all duration-500",
                         hoveredCardIndex === index ? "text-[16px] opacity-100 translate-y-0" : "text-[14px] opacity-60 translate-y-2"
                    )}>{card.subtitle}</p>
                 </div>
               </Link>
             ))}
          </div>
      </div>

      <header className="w-full fixed top-[22px] z-[9999] flex justify-center px-4">
        <nav
          className={cn(
            "flex items-center justify-between rounded-[16px] bg-white/95 backdrop-blur-sm pr-2 sm:pr-4", 
            "transition-shadow duration-300",
            "pl-[30px]", 
            isScrolled ? "shadow-lg" : "shadow-md"
          )}
          style={{
            width: '947px',
            maxWidth: '100%',
            height: '78px',
          }}
        >
            {/* Brand Logo - Left */}
            <Link href="/" className="flex items-center shrink-0 gap-0"> 
              <Image
                src="/images/New_Logo.png"
                alt="HealTalk logo"
                width={160}
                height={40}
                className="h-8 sm:h-10 w-auto"
              />
            </Link>

            {/* Navigation Links - Center (Desktop) */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-4" style={{ gap: '27px' }}>
              {links.map((link) => {
                if (link.isMegaMenu) {
                   return (
                      <button
                        key={link.label}
                        type="button"
                        className={cn(
                          "text-[15px] font-medium text-gray-900 transition-all duration-200 px-4 py-2 rounded-[20px] whitespace-nowrap",
                          "hover:bg-[#dcd5cb]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
                          isResourcesOpen && "bg-[#dcd5cb]"
                        )}
                        ref={resourcesLinkRef}
                        onPointerEnter={handleResourcesEnter}
                        onPointerLeave={handleResourcesLeave}
                        aria-expanded={isResourcesOpen}
                        aria-haspopup="true"
                      >
                        {link.label}
                      </button>
                   );
                }

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "text-[15px] font-medium text-gray-900 transition-all duration-200 px-4 py-2 rounded-[20px] whitespace-nowrap",
                      "hover:bg-[#dcd5cb]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions (Desktop) */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {/* Auth Buttons */}
              {isAuthenticated ? (
                <Link href={dashboardHref}>
                  <Button className="h-11 px-6 rounded-full bg-[#d5f567] text-black font-semibold text-[15px] hover:bg-[#c3e555] transition-colors duration-200 shadow-none border-0 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button className="h-11 px-6 rounded-full bg-white text-black font-medium text-[15px] hover:bg-gray-100 transition-colors duration-200 shadow-none border border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/onboarding/step-1">
                    <Button className="h-11 px-6 rounded-full bg-[#d5f567] text-black font-semibold text-[15px] hover:bg-[#c3e555] transition-colors duration-200 shadow-none border-0 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden items-center gap-3">
              {/* CTA Button (Mobile - visible) */}
              {isAuthenticated ? (
                <Link href={dashboardHref}>
                  <Button className="h-10 px-5 rounded-full bg-[#d5f567] text-black font-semibold text-sm hover:bg-[#c3e555] transition-colors duration-200 shadow-none border-0">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/onboarding/step-1">
                  <Button className="h-10 px-5 rounded-full bg-[#d5f567] text-black font-semibold text-sm hover:bg-[#c3e555] transition-colors duration-200 shadow-none border-0">
                    Get Started
                  </Button>
                </Link>
              )}

              {/* Hamburger Menu */}
              <Sheet open={open} onOpenChange={setOpen}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 text-gray-900 hover:bg-gray-100"
                  aria-label="Open menu"
                >
                  <MenuToggle
                    strokeWidth={2.5}
                    open={open}
                    onOpenChange={setOpen}
                    className="size-6"
                  />
                </Button>
                <SheetContent
                  className="bg-white gap-0 border-l border-gray-200"
                  showClose={false}
                  side="left"
                >
                  <SheetTitle className="sr-only">Main menu</SheetTitle>
                  <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
                    {links.filter((l) => !l.isMegaMenu).map((link) => (
                      <Link
                        key={link.label}
                        className={cn(
                          "px-4 py-3 text-base font-medium text-gray-900 rounded-lg transition-colors",
                          "hover:bg-[#dcd5cb]"
                        )}
                        href={link.href}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <span className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Resources</span>
                    {resourcesCards.map((card) => (
                      <Link
                        key={card.title}
                        className={cn(
                          "px-4 py-3 text-base font-medium text-gray-900 rounded-lg transition-colors",
                          "hover:bg-[#dcd5cb]"
                        )}
                        href={card.href}
                        onClick={() => setOpen(false)}
                      >
                        {card.title}
                      </Link>
                    ))}
                    {!isAuthenticated && (
                      <Link
                        href="/login"
                        className="px-4 py-3 text-base font-medium text-gray-900 hover:bg-[#dcd5cb] rounded-lg transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        Sign In
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
      </header>
    </>
  );
}
