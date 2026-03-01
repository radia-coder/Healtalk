import { Star, MapPin, Languages, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeroProps {
  psychologist: {
    name: string;
    credentials: string;
    experience: number;
    rating: number;
    reviewCount: number;
    hospital: string;
    location: string;
    languages: string[];
    photo?: string;
  };
}

export default function ProfileHero({ psychologist }: ProfileHeroProps) {
  return (
    <section className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Photo */}
          <div className="w-48 h-48 rounded-full overflow-hidden bg-card/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-4 border-background/30">
            <div className="w-40 h-40 rounded-full bg-card/40 flex items-center justify-center text-7xl font-bold text-background">
              {psychologist.name.split(' ')[1]?.[0] || psychologist.name[0]}
            </div>
          </div>

          {/* Info */}
          <div className="flex-grow text-center md:text-left text-background">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {psychologist.name}
            </h1>
            <p className="text-xl mb-1 text-background/90">
              {psychologist.credentials}
            </p>
            <p className="text-lg mb-4 text-background/80">
              {psychologist.experience} years experience
            </p>

            {/* Rating & Info Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-background/90">
              <div className="flex items-center gap-2 bg-card/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <Star className="text-accent fill-accent" size={18} />
                <span className="font-semibold">{psychologist.rating}</span>
                <span>({psychologist.reviewCount} reviews)</span>
              </div>

              <div className="flex items-center gap-2 bg-card/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <MapPin size={18} />
                <span>{psychologist.hospital}, {psychologist.location}</span>
              </div>

              <div className="flex items-center gap-2 bg-card/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <Languages size={18} />
                <span>{psychologist.languages.join(", ")}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button size="lg" className="bg-card text-primary hover:bg-card/90 px-8">
                <Calendar className="mr-2" size={20} />
                Book Appointment
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-background text-background hover:bg-card/20 px-8"
              >
                <MessageCircle className="mr-2" size={20} />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
