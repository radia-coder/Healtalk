import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResourcesPage() {
  const cards = [
    {
      title: "Blog",
      subtitle: "Practical tips and insider info.",
      href: "/resources/blog",
    },
    {
      title: "Podcasts",
      subtitle: "Insights from TA leaders.",
      href: "/resources/podcasts",
    },
    {
      title: "Guides",
      subtitle: "Hiring trends and analyses.",
      href: "/resources/guides",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] px-4 py-32">
       <div className="max-w-7xl mx-auto">
          <div className="mb-12">
             <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6">
                <ArrowLeft size={18} /> Back to Home
             </Link>
             <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 mb-4">Resources</h1>
             <p className="text-lg text-slate-600 max-w-2xl">Explore our latest articles, expert insights, and comprehensive guides.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             {cards.map((card) => (
               <Link key={card.title} href={card.href} className="group block h-full">
                 <div className="h-full bg-white rounded-[22px] border border-[#E8E6E1] p-8 md:p-12 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all duration-300 flex flex-col items-center justify-center text-center gap-3">
                    <h2 className="text-4xl md:text-5xl font-display text-[#1a1a1a]">{card.title}</h2>
                    <p className="text-sm md:text-base text-[#666666] font-sans">{card.subtitle}</p>
                 </div>
               </Link>
             ))}
          </div>
       </div>
    </div>
  );
}
