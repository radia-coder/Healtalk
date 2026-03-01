import { GraduationCap, Award } from "lucide-react";

interface EducationSectionProps {
  psychologist: {
    education?: Array<{
      degree: string;
      institution: string;
      year: number;
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      year: number;
    }>;
  };
}

export default function EducationSection({ psychologist }: EducationSectionProps) {
  if (!psychologist.education && !psychologist.certifications) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-foreground mb-6">
        Education & Certifications
      </h2>

      <div className="space-y-6">
        {/* Education */}
        {psychologist.education?.map((edu, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <GraduationCap className="text-primary" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg text-foreground">{edu.degree}</h4>
              <p className="text-text-secondary">{edu.institution}, {edu.year}</p>
            </div>
          </div>
        ))}

        {/* Certifications */}
        {psychologist.certifications?.map((cert, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="text-accent" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg text-foreground">{cert.name}</h4>
              <p className="text-text-secondary">{cert.issuer}, {cert.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
