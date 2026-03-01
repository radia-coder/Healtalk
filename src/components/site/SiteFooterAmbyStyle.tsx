import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Linkedin, Instagram, Facebook, Youtube } from "lucide-react";

export function SiteFooterAmbyStyle() {
  return (
    <footer className="w-full bg-[#F3EEE6] pt-20 pb-8 px-4 md:px-8 border-t border-[#E8E6E1]">
        <div className="max-w-[1240px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
                {/* Brand Column */}
                <div className="md:col-span-3">
                    <Link href="/" className="inline-block">
                        <span className="font-display text-5xl md:text-6xl text-[#1a1a1a]">Amby</span>
                    </Link>
                </div>

                {/* Services Column */}
                <div className="md:col-span-2 md:col-start-5 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-900">SERVICES</h4>
                    <ul className="space-y-2 text-sm text-gray-900 font-medium underline decoration-1 decoration-gray-400 underline-offset-4 hover:decoration-gray-900 transition-all">
                        <li><Link href="#">Recruitment</Link></li>
                        <li><Link href="#">Recruitment for Growth</Link></li>
                        <li><Link href="#">Recruitment for Enterprise</Link></li>
                        <li><Link href="#">RPO as a Service</Link></li>
                        <li><Link href="#">Hired for Good</Link></li>
                    </ul>
                </div>

                {/* Company Column */}
                <div className="md:col-span-2 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-900">COMPANY</h4>
                    <ul className="space-y-2 text-sm text-gray-900 font-medium underline decoration-1 decoration-gray-400 underline-offset-4 hover:decoration-gray-900 transition-all">
                        <li><Link href="#">About us</Link></li>
                        <li><Link href="#">Contact us</Link></li>
                        <li><Link href="#">Open positions</Link></li>
                        <li><Link href="#">Whistleblowing form</Link></li>
                         <li><Link href="#">GHG Emissions Report</Link></li>
                    </ul>
                </div>

                {/* Resources Column */}
                <div className="md:col-span-2 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-900">RESOURCES</h4>
                    <ul className="space-y-2 text-sm text-gray-900 font-medium underline decoration-1 decoration-gray-400 underline-offset-4 hover:decoration-gray-900 transition-all">
                        <li><Link href="/resources/blog">Blog</Link></li>
                        <li><Link href="/resources/guides">Guides</Link></li>
                        <li><Link href="/resources/podcasts">Podcasts</Link></li>
                    </ul>
                </div>

                 {/* Contact Column */}
                <div className="md:col-span-2 md:col-start-11 space-y-8">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-900">CONTACT</h4>
                        <div className="text-sm text-gray-900 space-y-1">
                            <Link href="mailto:hello@amby.com" className="block underline decoration-1 decoration-gray-400 underline-offset-4 hover:decoration-gray-900">hello@amby.com</Link>
                        </div>
                        <div className="text-sm text-gray-900 space-y-1">
                            <p>Thorvald Meyers gate 7<br/>0555 Oslo<br/>Norway</p>
                        </div>
                         <div className="text-sm text-gray-900 space-y-1">
                            <p>Drottninggatan 33<br/>111 51 Stockholm<br/>Sweden</p>
                        </div>
                    </div>

                    <div className="flex gap-4 text-gray-900">
                        <Linkedin size={18} className="hover:text-gray-600 cursor-pointer" />
                        <Instagram size={18} className="hover:text-gray-600 cursor-pointer" />
                        <Facebook size={18} className="hover:text-gray-600 cursor-pointer" />
                        <Youtube size={18} className="hover:text-gray-600 cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* Illustration Section - Placeholder SVG if image unavailable, or reuse existing image */}
            <div className="flex justify-center mb-16">
                 {/* Reusing the previously generated footer illustration */}
                 <Image
                    src="/blog_footer_illustration.png" 
                    alt="Hands holding binoculars" 
                    width={500}
                    height={280}
                    className="w-full max-w-[500px] h-auto object-contain mix-blend-multiply opacity-90"
                 />
            </div>

             {/* Bottom Legal */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-gray-300 pt-6 text-[10px] uppercase font-bold tracking-wider text-gray-900 gap-4">
                <div>AMBY © 2026</div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 underline decoration-1 decoration-gray-400 underline-offset-4">
                    <Link href="#">Privacy Policy</Link>
                    <Link href="#">Website Privacy Notice</Link>
                    <Link href="#">Transparency Statement</Link>
                </div>
            </div>
        </div>
    </footer>
  );
}
