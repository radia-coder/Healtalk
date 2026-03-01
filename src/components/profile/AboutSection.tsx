import { CheckCircle } from "lucide-react";

interface AboutSectionProps {
  psychologist: {
    name: string;
    bio: string;
    specializations: string[];
  };
}

export default function AboutSection({ psychologist }: AboutSectionProps) {
  return (
    <div className="mb-12">
      {/* About */}
      <h2 className="text-3xl font-bold text-foreground mb-4">
        About {psychologist.name.split(' ')[1] || psychologist.name}
      </h2>
      <p className="text-base text-text-secondary leading-relaxed mb-8">
        {psychologist.bio}
      </p>

      {/* Specializations */}
      <h3 className="text-2xl font-bold text-foreground mb-4">
        Areas of Expertise
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {psychologist.specializations.map((spec) => (
          <div
            key={spec}
            className="flex items-start gap-3 bg-background p-4 rounded-lg"
          >
            <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
            <span className="text-foreground font-medium">{spec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
