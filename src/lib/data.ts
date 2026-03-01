// Placeholder data for psychologists
export const psychologists = [
  {
    id: 1,
    name: "Dr. Ahmet Yılmaz",
    credentials: "PhD, Clinical Psychologist",
    experience: 12,
    rating: 4.8,
    reviewCount: 120,
    specializations: ["Anxiety Disorders", "Depression", "Trauma & PTSD"],
    hospital: "Acıbadem Hospital",
    location: "Istanbul",
    languages: ["Turkish", "English"],
    nextAvailable: "Tomorrow at 2:00 PM",
    price: 500,
    photo: "/images/doctor-1.jpg",
    bio: "Dr. Ahmet Yılmaz is a licensed clinical psychologist with over 12 years of experience in treating anxiety disorders, depression, and trauma. He completed his PhD at Istanbul University and has worked with hundreds of patients to improve their mental wellbeing.",
    education: [
      {
        degree: "PhD in Clinical Psychology",
        institution: "Istanbul University",
        year: 2012,
      },
      {
        degree: "Master's in Psychology",
        institution: "Boğaziçi University",
        year: 2008,
      },
    ],
    certifications: [
      {
        name: "Licensed Clinical Psychologist",
        issuer: "Turkish Psychological Association",
        year: 2013,
      },
      {
        name: "Cognitive Behavioral Therapy Certification",
        issuer: "Beck Institute",
        year: 2015,
      },
    ],
  },
  {
    id: 2,
    name: "Dr. Ayşe Demir",
    credentials: "PhD, Clinical Psychologist",
    experience: 15,
    rating: 4.9,
    reviewCount: 200,
    specializations: ["Depression", "Family Therapy", "Couples Counseling"],
    hospital: "Memorial Hospital",
    location: "Istanbul",
    languages: ["Turkish", "English", "Arabic"],
    nextAvailable: "Today at 4:00 PM",
    price: 600,
    photo: "/images/doctor-2.jpg",
    bio: "Dr. Ayşe Demir specializes in depression treatment and family therapy with over 15 years of experience helping families and couples build healthier relationships.",
  },
  {
    id: 3,
    name: "Dr. Mehmet Öz",
    credentials: "PhD, Clinical Psychologist",
    experience: 10,
    rating: 4.7,
    reviewCount: 95,
    specializations: [
      "Anxiety Disorders",
      "Panic Disorders",
      "Stress Management",
    ],
    hospital: "Medical Park",
    location: "Ankara",
    languages: ["Turkish", "English"],
    nextAvailable: "Monday at 10:00 AM",
    price: 450,
    photo: "/images/doctor-3.jpg",
    bio: "Dr. Mehmet Öz is an expert in anxiety and panic disorders, helping patients develop coping strategies for stress management.",
  },
  {
    id: 4,
    name: "Dr. Zeynep Kaya",
    credentials: "PhD, Child Psychologist",
    experience: 8,
    rating: 4.9,
    reviewCount: 150,
    specializations: [
      "Child Psychology",
      "Adolescent Therapy",
      "Family Therapy",
    ],
    hospital: "Florence Nightingale",
    location: "Istanbul",
    languages: ["Turkish", "English"],
    nextAvailable: "Wednesday at 3:00 PM",
    price: 550,
    photo: "/images/doctor-4.jpg",
    bio: "Dr. Zeynep Kaya specializes in child and adolescent psychology, providing compassionate care for young patients and their families.",
  },
];

// Testimonials data
export const testimonials = [
  {
    id: 1,
    name: "Ayşe K.",
    age: 28,
    text: "HealTalk changed my life. Dr. Ahmet helped me overcome my anxiety with patience and practical techniques. I finally feel like myself again.",
    rating: 5,
    photo: "/images/patient-1.jpg",
  },
  {
    id: 2,
    name: "Mehmet S.",
    age: 35,
    text: "The convenience of video consultations made it easy for me to get help. Dr. Ayşe is incredibly professional and understanding.",
    rating: 5,
    photo: "/images/patient-2.jpg",
  },
  {
    id: 3,
    name: "Elif Y.",
    age: 42,
    text: "I was skeptical at first, but the platform is secure and the psychologists are truly talented. Highly recommended for anyone seeking support.",
    rating: 5,
    photo: "/images/patient-3.jpg",
  },
];

// Reviews data
export const reviews = [
  {
    id: 1,
    psychologistId: 1,
    patientName: "Ayşe K.",
    rating: 5,
    date: "2026-01-20",
    text: "Dr. Ahmet is incredibly professional and caring. He helped me overcome my anxiety with practical techniques that I use every day.",
    helpful: 12,
    notHelpful: 0,
  },
  {
    id: 2,
    psychologistId: 1,
    patientName: "Can M.",
    rating: 5,
    date: "2026-01-15",
    text: "Best psychologist I've ever worked with. Very understanding and provides excellent guidance.",
    helpful: 8,
    notHelpful: 0,
  },
  {
    id: 3,
    psychologistId: 1,
    patientName: "Selin T.",
    rating: 4,
    date: "2026-01-10",
    text: "Great experience overall. The sessions were helpful and I noticed improvement in my mental health.",
    helpful: 5,
    notHelpful: 1,
  },
];

// Statistics data
export const statistics = [
  { label: "Happy Patients", value: 1234, suffix: "+" },
  { label: "Licensed Psychologists", value: 45, suffix: "" },
  { label: "Average Rating", value: 4.8, suffix: "/5" },
  { label: "Partner Hospitals", value: 10, suffix: "" },
];

// Specializations list
export const specializations = [
  "Anxiety Disorders",
  "Depression",
  "Trauma & PTSD",
  "Family Therapy",
  "Couples Counseling",
  "Child Psychology",
  "Addiction",
  "Panic Disorders",
  "Stress Management",
  "Grief Counseling",
  "Eating Disorders",
  "OCD",
];

// Hospitals list
export const hospitals = [
  "Acıbadem Hospital",
  "Memorial Hospital",
  "Medical Park",
  "Florence Nightingale",
  "American Hospital",
  "Liv Hospital",
];

// Cities list
export const cities = ["Istanbul", "Ankara", "Izmir", "All Cities"];

// Conditions list for filtering
export const conditionsList = [
  "Anxiety Disorders",
  "Depression",
  "Trauma & PTSD",
  "Family Therapy",
  "Couples Counseling",
  "Child Psychology",
  "Addiction",
  "Panic Disorders",
  "Stress Management",
  "Grief Counseling",
  "Eating Disorders",
  "OCD",
  "Bipolar Disorder",
  "ADHD",
  "Sleep Disorders",
  "Anger Management"
];

// Languages list for filtering
export const languagesList = [
  "English",
  "Turkish",
  "Arabic",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Russian",
  "Italian",
  "Portuguese"
];
