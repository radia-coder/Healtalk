"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    text: "I was nervous to try therapy, but my first session felt like talking to someone who genuinely cared. It made a real difference.",
    name: "Arne N.",
    role: "Client",
    image: "/images/portrait-1.png",
  },
  {
    id: 2,
    text: "I booked in under five minutes and the session felt completely safe. I didn't expect it to feel so normal — in a good way.",
    name: "Nora M.",
    role: "Client",
    image: "/images/portrait-2.png",
  },
  {
    id: 3,
    text: "I kept telling myself I could handle it alone. Starting therapy was the best decision I've made this year.",
    name: "Sarah A.",
    role: "Client",
    image: "/images/portrait-3.png",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section id="testimonials" className="pt-12 pb-12 bg-[#F6F2EA] flex flex-col items-center font-sans text-[#121E0D]">
      <div className="w-full max-w-[1400px] px-4 flex flex-col items-center">
        
        {/* Title: Centered, Switzer 700 */}
        <div className="text-center mb-10 relative z-20">
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight text-[#121E0D]" style={{ fontFamily: 'Switzer, sans-serif' }}>
            What Our Patients Say.
          </h2>
        </div>

        {/* Card Container - Relative for absolute pill positioning */}
        <div className="relative w-full max-w-[1209px] flex justify-center">
          
          {/* OVERLAY NAV PILL */}
          {/* Centered on Top Edge (Half in/out approximately, or just sitting on edge) */}
          {/* User asked for "sit slightly inside the card's top edge (not floating far above it)" */}
          {/* Using -top-[26px] centers it exactly on the border line which is standard 'overlay' */}
          <div className="absolute -top-[26px] left-1/2 -translate-x-1/2 w-[100px] h-[52px] bg-[#8888FC] rounded-[56px] flex items-center justify-center gap-2 px-1 z-30 shadow-sm">
            <button
              onClick={handlePrevious}
              className="w-[36px] h-[36px] rounded-full border-2 border-[#121E0D] flex items-center justify-center hover:bg-black/5 transition-colors text-[#121E0D]"
              aria-label="Previous testimonial"
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
            <button
              onClick={handleNext}
              className="w-[36px] h-[36px] rounded-full border-2 border-[#121E0D] flex items-center justify-center hover:bg-black/5 transition-colors text-[#121E0D]"
              aria-label="Next testimonial"
            >
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Testimonial Card */}
          {/* Exact dimensions: 1209px width, 530px min-height */}
          <div className="bg-[#EBEBFF] rounded-[40px] px-8 py-16 sm:px-[88px] sm:py-[72px] w-full min-h-[530px] flex flex-col md:flex-row items-center gap-12 md:gap-24">
            
            {/* Left Column: Text */}
            <div className="flex-1 flex flex-col items-start relative h-full justify-between">
              <div>
                {/* Quote Icon */}
                <div className="mb-8">
                   <svg width="60" height="44" viewBox="0 0 58 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.6 42C5.2 42 0.8 37.8 0.8 30.6C0.8 23.4 5.4 12.6 19.6 0.8L23.8 5.6C15.2 13.2 12 19 11.6 22.8C13.2 22 15 21.6 16.8 21.6C23.2 21.6 27.6 26.2 27.6 32C27.6 37.8 23 42 16.8 42C15 42 13.2 41.8 11.6 42ZM39.6 42C33.2 42 28.8 37.8 28.8 30.6C28.8 23.4 33.4 12.6 47.6 0.8L51.8 5.6C43.2 13.2 40 19 39.6 22.8C41.2 22 43 21.6 44.8 21.6C51.2 21.6 55.6 26.2 55.6 32C55.6 37.8 51 42 44.8 42C43 42 41.2 41.8 39.6 42Z" fill="#121E0D"/>
                   </svg>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-[28px] sm:text-[32px] leading-[1.3] font-serif text-[#121E0D] mb-12">
                      {activeTestimonial.text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Author */}
              <div className="mt-auto">
                 <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="text-[20px] font-bold text-[#121E0D]" style={{ fontFamily: 'Switzer, sans-serif' }}>
                      {activeTestimonial.name}
                    </h4>
                    <p className="text-[17px] italic text-[#121E0D]/70 mt-1 font-serif">
                      {activeTestimonial.role}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Image */}
            {/* 200x299px */}
            <div className="w-full md:w-auto flex justify-center md:block self-center">
              <div className="relative w-[200px] h-[299px] rounded-[24px] overflow-hidden shadow-sm bg-gray-200 shrink-0">
                  <Image
                    src={activeTestimonial.image}
                    alt={activeTestimonial.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                    priority
                  />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
