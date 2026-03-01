export default function AboutHero() {
  return (
    <div className="bg-[#fff7f2] w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center overflow-hidden">
      {/* 1. Hero Headline */}
      <h1 className="font-logo text-5xl md:text-6xl lg:text-7xl text-foreground text-center leading-[1.1] max-w-4xl tracking-tight mb-16 relative z-10">
        The talent partner for <br className="hidden md:block" />
        <span className="relative inline-block">
          ambitious
          <svg
            className="absolute -bottom-2 md:-bottom-3 left-0 w-full h-3 md:h-4 text-primary-teal pointer-events-none"
            viewBox="0 0 200 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M2.00025 6.99997C45.2818 4.2045 105.106 -0.669813 194.594 2.80914"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </span>{" "}
        companies.
      </h1>

      {/* 2. Large Hero Image Card */}
      <div className="w-full max-w-[1200px] aspect-[16/9] md:aspect-[21/9] relative rounded-[2.5rem] overflow-hidden shadow-2xl mb-16 bg-[#e8d5cc]">
        {/* Placeholder for the image */}
        <div className="absolute inset-0 flex items-center justify-center text-text-secondary bg-gray-200">
           {/* In a real scenario, use next/image here */}
           <span className="text-xl font-medium">Hero Image Placeholder</span>
        </div>
        {/* <Image
          src="/path/to/hero.jpg"
          alt="Office culture"
          fill
          className="object-cover"
          priority
        /> */}
      </div>

      {/* 3. Trusted By Logo Strip */}
      <div className="w-full max-w-6xl flex flex-col items-center">
        <p className="text-sm md:text-base font-bold text-center mb-8 font-sans">
          Trusted by the creme de la creme.
        </p>

        <div className="flex flex-wrap justify-center gap-4 w-full">
          {/* Logo Tiles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-24 h-24 md:w-32 md:h-32 bg-white/50 rounded-2xl flex items-center justify-center p-4 hover:bg-white/80 transition-colors duration-300"
            >
              {/* Placeholder Logo */}
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                Logo {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
