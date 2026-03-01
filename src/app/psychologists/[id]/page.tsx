import ProfileHeaderCard from "@/components/psychologists/ProfileHeaderCard";
import ConnectCard from "@/components/psychologists/ConnectCard";
import MobileBookingBar from "@/components/psychologists/MobileBookingBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, ThumbsUp, Shield, Star, Video, Image as ImageIcon, CreditCard, Building, MapPin, ExternalLink, BadgeCheck, Phone, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Update interface for Next.js 15+ where params is a Promise
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getPsychologist(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/psychologists/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const psychologist = await res.json();

    // Transform API data to match component expectations
    return {
      id: psychologist.id,
      name: psychologist.user.name,
      title: psychologist.credentials,
      image: psychologist.user.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
      verified: true,
      rating: psychologist.rating,
      reviewCount: psychologist.reviewCount,
      location: psychologist.hospital?.location || 'Remote',
      priceRange: `$${(psychologist.price60 / 100).toFixed(0)} - $${(psychologist.price90 / 100).toFixed(0)}`,
      languages: ['English'], // Default since not in DB yet
      conditions: psychologist.specializations,
      about: psychologist.bio,
      experience: psychologist.experience,
      sessionDuration: '50 min',
      nextAvailable: 'Tomorrow',
      licenseNumber: psychologist.licenseNumber,
      highlights: [
        { icon: "Video", label: "Available Online", color: "bg-green-100 text-green-800" },
        { icon: "Star", label: "Top Choice", color: "bg-teal-100 text-teal-800" }
      ],
      photos: ['https://images.unsplash.com/photo-1516357231954-91487b459602?auto=format&fit=crop&q=80&w=600&h=400'],
      insurances: ['Aetna', 'BlueCross', 'Cigna'],
      testimonials: [
        {
          name: 'Patient',
          text: 'Excellent care and support.',
          role: 'Patient',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300'
        }
      ],
      education: [
        { degree: 'PhD in Clinical Psychology', school: 'University', year: '2005' }
      ],
      qualifications: [
        { name: 'Licensed Psychologist', issuer: 'State Board' }
      ],
    };
  } catch (error) {
    console.error('Error fetching psychologist:', error);
    return null;
  }
}

export default async function PsychologistProfilePage({ params }: PageProps) {
  const { id } = await params;
  const therapist = await getPsychologist(id);

  if (!therapist) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Psychologist Not Found</h1>
            <Link href="/find-psychologists">
                <Button>Back to Search</Button>
            </Link>
        </div>
    );
  }

  // Helper for highlights icons
  const getIcon = (iconName: string) => {
    switch(iconName) {
        case 'Star': return <Star size={14} className="fill-current" />;
        case 'Video': return <Video size={14} />;
        case 'ThumbsUp': return <ThumbsUp size={14} />;
        case 'Shield': return <Shield size={14} />;
        case 'Users': return <Star size={14} />; 
        default: return <Star size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-28 lg:pb-0">
         {/* Top Gradient Wash */}
         <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-rose-50/60 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
         
         {/* Utility Top Bar */}
         <div className="flex items-center justify-between mb-8">
            <Link href="/find-psychologists" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft size={18} />
                Back
            </Link>
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 gap-2">
                <Share2 size={18} />
                Share
            </Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-8">
                <ProfileHeaderCard therapist={therapist} />
                
                {/* Sticky Tabs Navigation */}
                <Tabs defaultValue="about" className="w-full mt-10">
                    <div className="sticky top-0 z-20 bg-[#FDFCF8]/95 backdrop-blur-sm pt-2">
                    <TabsList className="w-full flex justify-start bg-transparent border-b border-border mb-8 gap-8 overflow-x-auto no-scrollbar rounded-none h-auto p-0 pb-1">
                        {["About", "My Photos", "Finances", "Experience", "Treatment", "Location", "Testimonials"].map((tab) => (
                             <TabsTrigger 
                                key={tab} 
                                value={tab.toLowerCase().replace(' ', '-')}
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 px-0 py-3 text-base font-medium text-slate-500 hover:text-slate-800 transition-all bg-transparent shadow-none"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    </div>

                    <TabsContent value="about" className="space-y-12 animate-in fade-in-50 duration-500">
                        {/* About Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">About</h2>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-8">
                                <p>{therapist.about}</p>
                                <p>Dr. {therapist.name.split(' ').pop()} implies a warm, non-judgmental environment where patients can explore their thoughts and feelings safely. With a strong background in clinical psychology, therapy sessions are tailored to meet unique individual needs.</p>
                                <Link href="#" className="text-teal-600 font-semibold hover:underline">See more</Link>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-4">Highlights</h3>
                            <div className="flex flex-wrap gap-3">
                                {therapist.highlights?.map((highlight, i) => (
                                    <span key={i} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${highlight.color}`}>
                                        {getIcon(highlight.icon)}
                                        {highlight.label}
                                    </span>
                                ))}
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                                    <Star size={14} /> {therapist.experience} years experience
                                </span>
                            </div>
                        </section>
                        <Separator />
                    </TabsContent>

                    <TabsContent value="my-photos" className="space-y-12 animate-in fade-in-50 duration-500">
                        {/* Photos Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">My Photos ({therapist.photos?.length || 0})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {therapist.photos?.slice(0, 3).map((photo, index) => (
                                    <div key={index} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                                        <Image src={photo} alt={`Office photo ${index + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                        {index === 2 && (
                                            <Button variant="secondary" size="sm" className="absolute bottom-4 left-4 bg-white/90 backdrop-blur hover:bg-white text-slate-900 font-semibold shadow-sm">
                                                <ImageIcon size={16} className="mr-2" />
                                                Show all photos
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                        <Separator />
                    </TabsContent>

                    <TabsContent value="finances" className="space-y-12 animate-in fade-in-50 duration-500">
                         {/* Finances Section */}
                         <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Finances</h2>
                            <div className="flex flex-col md:flex-row gap-8 mb-8">
                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                    <span className="text-orange-500 font-bold">$</span>
                                    {therapist.priceRange.split(' ')[0]} per session
                                </div>
                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                    <CreditCard size={18} className="text-orange-500" />
                                    Bank Transfer • Cash • Credit Card
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-orange-500" />
                                Insurance Accepted
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {therapist.insurances?.map((ins) => (
                                    <div key={ins} className="h-16 flex items-center justify-center bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-center text-xs font-bold text-slate-600 grayscale hover:grayscale-0 transition-all">
                                        {ins}
                                    </div>
                                ))}
                            </div>
                        </section>
                        <Separator />
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-12 animate-in fade-in-50 duration-500">
                        {/* Experience Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Experience</h2>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                    <Star size={18} className="text-orange-500 fill-orange-500" />
                                    In Practice for {therapist.experience} Years
                                </div>
                                <div className="text-sm text-slate-500">
                                    Licence Number: <span className="text-slate-900 font-medium">{therapist.licenseNumber || "N/A"}</span> • {therapist.location}
                                </div>
                            </div>
                             <p className="text-slate-600 leading-relaxed max-w-3xl">
                                {therapist.name} began {therapist.name.split(' ')[0] === 'Ms.' ? 'her' : 'their'} career at a prestigious medical center, developing a deep interest in both clinical and research aspects of mental health. Over the years, {therapist.name.split(' ')[0] === 'Ms.' ? 'she has' : 'they have'} held various positions including Senior Specialist and Director of Mental Health Services.
                             </p>
                        </section>

                        {/* Qualifications / Education */}
                        <section>
                            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center gap-4 mb-8">
                                <div className="p-2 bg-teal-100 rounded-full text-teal-600">
                                     <BadgeCheck size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-teal-900">Verified by HealTalk</h4>
                                    <p className="text-sm text-teal-700">Membership with American Psychological Association</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Qualifications</h3>
                                    <ul className="space-y-6">
                                        {therapist.qualifications?.map((q, i) => (
                                            <li key={i} className="flex justify-between items-start group">
                                                <span className="font-medium text-slate-700">{q.name}</span>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-slate-400 block mb-1 group-hover:text-teal-600 transition-colors uppercase tracking-wider">{q.issuer}</span>
                                                     <Building size={20} className="ml-auto text-slate-300" />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Education</h3>
                                     <ul className="space-y-6">
                                        {therapist.education?.map((edu, i) => (
                                            <li key={i} className="flex justify-between items-start group">
                                                <div>
                                                    <span className="font-medium text-slate-700 block">{edu.degree}</span>
                                                    <span className="text-sm text-slate-500">{edu.year}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-slate-900 block mb-1">{edu.school}</span>
                                                    <CreditCard size={20} className="ml-auto text-slate-300" /> {/* Placeholder icon */}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                        <Separator />
                    </TabsContent>

                    <TabsContent value="treatment" className="space-y-12 animate-in fade-in-50 duration-500">
                         {/* Treatment / Languages */}
                         <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Languages</h2>
                            <div className="flex flex-wrap gap-3">
                                {therapist.languages.map(lang => (
                                    <span key={lang} className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-100">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </section>
                        <Separator />
                    </TabsContent>

                    <TabsContent value="location" className="space-y-12 animate-in fade-in-50 duration-500">
                         {/* Location Section */}
                         <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Location</h2>
                            {/* Map Placeholder */}
                            <div className="w-full h-80 bg-slate-100 rounded-2xl border border-slate-200 mb-6 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=13&size=600x300')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"></div>
                                <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-xl shadow-sm text-slate-600 font-medium z-10 flex flex-col items-center gap-2">
                                     <MapPin size={24} className="text-orange-500" />
                                     <span>Interactive Map Unavailable in Demo</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <MapPin size={24} className="text-orange-500 mt-1" />
                                    <div>
                                        <p className="font-bold text-slate-900 text-lg">{therapist.location}</p>
                                        <p className="text-slate-500">Suite 200, Medical Arts Building</p>
                                    </div>
                                </div>
                                <Link href="#" className="font-bold text-teal-600 hover:underline">View Directions</Link>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-8">
                                <Button variant="outline" className="h-12 border-slate-200">
                                    <Phone size={18} className="mr-2" /> Call me
                                </Button>
                                <Button variant="outline" className="h-12 border-slate-200">
                                    <Mail size={18} className="mr-2" /> Email me
                                </Button>
                                 <Button variant="outline" className="h-12 border-slate-200">
                                    <ExternalLink size={18} className="mr-2" /> My Website
                                </Button>
                            </div>
                        </section>
                        <Separator />
                    </TabsContent>

                     <TabsContent value="testimonials" className="space-y-12 animate-in fade-in-50 duration-500">
                        {/* Testimonials */}
                         <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">Testimonials</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {therapist.testimonials?.map((t, i) => (
                                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                                        <p className="text-slate-600 mb-6 flex-1 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                                        <div className="flex items-center gap-3 mt-auto">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                                                <Image src={t.image} alt={t.name} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                                                <p className="text-xs text-slate-500">{t.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        
                        <div className="text-sm text-slate-400 pt-8 border-t border-slate-100">
                            Last Modified Date: 19th May 2026
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Right Column (Sticky Sidebar) */}
            <div className="lg:col-span-4 relative hidden lg:block">
                <ConnectCard therapist={therapist} />
            </div>
         </div>

      </div>

      {/* Footer Placeholder (since we can't reuse the complex one easily in this one-shot without seeing it) */}
      <footer className="border-t border-[#D9D1C4] bg-[#F6F2EA] pt-16 pb-8 mt-20">
          <div className="max-w-7xl mx-auto px-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                  <div className="col-span-2">
                       <h3 className="font-logo text-2xl font-bold mb-4">HealTalk</h3>
                       <p className="text-slate-500 text-sm max-w-sm mb-6">Connecting you with the best mental health professionals for a better tomorrow.</p>
                       <div className="flex gap-4">
                           {/* Socials Placeholders */}
                           <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                           <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                           <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                       </div>
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 mb-4">Addiction</h4>
                      <ul className="space-y-2 text-sm text-slate-500">
                          <li>Alcohol Use</li>
                          <li>Cocaine</li>
                          <li>Fentanyl</li>
                          <li>Meth</li>
                      </ul>
                  </div>
                   <div>
                      <h4 className="font-bold text-slate-900 mb-4">Treatment</h4>
                      <ul className="space-y-2 text-sm text-slate-500">
                          <li>Inpatient Rehab</li>
                          <li>Detox</li>
                          <li>Therapy</li>
                          <li>Aftercare</li>
                      </ul>
                  </div>
                   <div>
                      <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                      <ul className="space-y-2 text-sm text-slate-500">
                          <li>About Us</li>
                          <li>Contact</li>
                          <li>Careers</li>
                          <li>Press</li>
                      </ul>
                  </div>
              </div>
              <div className="border-t border-[#E8DFD0] pt-8 flex justify-between items-center text-sm text-slate-400">
                  <p>© 2026 HealTalk. All rights reserved.</p>
                  <div className="flex gap-6">
                      <span>Privacy Policy</span>
                      <span>Terms of Service</span>
                  </div>
              </div>
          </div>
      </footer>
      <MobileBookingBar therapist={therapist} />
    </div>
  );
}
