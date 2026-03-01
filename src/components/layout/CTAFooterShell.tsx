import CTASection from "@/components/home/CTASection";
import Footer from "@/components/layout/Footer";

export default function CTAFooterShell() {
  return (
    <div className="flex flex-col w-full">
      {/* CTA Section - Video Background */}
      <CTASection />

      {/* Footer - Solid Dark Block */}
      {/* 
        NO vertical gap (stacking directly).
        Background: #061b0f
        Top Border: 1px solid rgba(255,255,255,0.12)
        Subtle Top Shadow: using box-shadow
      */}
      <div 
        className="relative w-full bg-[#061b0f] border-t border-white/10 shadow-[0_-1px_3px_rgba(0,0,0,0.5)] z-20"
      >
        <Footer withShell={false} theme="dark" />
      </div>
    </div>
  );
}
