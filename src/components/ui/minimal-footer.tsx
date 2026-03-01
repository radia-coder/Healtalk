import Link from "next/link";
import Image from "next/image";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react";

export function MinimalFooter() {
  const year = new Date().getFullYear();

  const company = [
    {
      title: "About",
      href: "/about",
    },
    {
      title: "Our Psychologists",
      href: "/find-psychologists",
    },
    {
      title: "Client Stories",
      href: "/#testimonials",
    },
    {
      title: "Privacy Policy",
      href: "/privacy",
    },
    {
      title: "Terms",
      href: "/terms",
    },
  ];

  const resources = [
    {
      title: "Get Started",
      href: "/onboarding/step-1",
    },
    {
      title: "Sign In",
      href: "/login",
    },
    {
      title: "Find a Therapist",
      href: "/find-psychologists",
    },
    {
      title: "Contact",
      href: "/contact",
    },
    {
      title: "Create Account",
      href: "/signup",
    },
  ];

  const socialLinks = [
    {
      icon: <FacebookIcon className="size-4" />,
      link: "https://facebook.com",
    },
    {
      icon: <InstagramIcon className="size-4" />,
      link: "https://instagram.com",
    },
    {
      icon: <LinkedinIcon className="size-4" />,
      link: "https://linkedin.com",
    },
    {
      icon: <TwitterIcon className="size-4" />,
      link: "https://twitter.com",
    },
    {
      icon: <YoutubeIcon className="size-4" />,
      link: "https://youtube.com",
    },
  ];

  return (
    <footer className="relative">
      <div className="bg-[radial-gradient(35%_80%_at_30%_0%,hsl(var(--primary)/.08),transparent)] mx-auto max-w-4xl md:border-x">
        <div className="bg-border absolute inset-x-0 h-px w-full" />
        <div className="grid max-w-4xl grid-cols-6 gap-6 p-4">
          <div className="col-span-6 flex flex-col gap-5 md:col-span-4">
            <Link href="/" className="w-max opacity-25 flex items-center gap-2">
              <Image
                src="/images/New_Logo.png"
                alt="HealTalk logo"
                width={160}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-muted-foreground max-w-sm font-mono text-sm text-balance">
              Private, supportive therapy with licensed psychologists.
              Start when you feel ready.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  className="hover:bg-accent rounded-md border p-1.5 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={item.link}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-muted-foreground mb-1 text-xs">Resources</span>
            <div className="flex flex-col gap-1">
              {resources.map(({ href, title }, i) => (
                <Link
                  key={i}
                  className="w-max py-1 text-sm duration-200 hover:underline"
                  href={href}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-muted-foreground mb-1 text-xs">Company</span>
            <div className="flex flex-col gap-1">
              {company.map(({ href, title }, i) => (
                <Link
                  key={i}
                  className="w-max py-1 text-sm duration-200 hover:underline"
                  href={href}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-border absolute inset-x-0 h-px w-full" />
        <div className="flex max-w-4xl flex-col justify-between gap-2 pt-2 pb-5">
          <p className="text-muted-foreground text-center font-thin">
            © {year} <Link href="/" className="hover:underline">HealTalk</Link>. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
