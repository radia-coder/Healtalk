export const psychologistSeedData = [
  // --- United States ---
  {
    user: { name: "Dr. Sarah Thompson", email: "sarah.thompson@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-NY-12345",
    experience: 10,
    bio: "Dr. Sarah Thompson is a Clinical Psychologist with over 10 years of experience specializing in anxiety, depression, and trauma.",
    specializations: ["Anxiety", "Depression", "Trauma"],
    price60: 15000, // $150 in cents
    price90: 25000, // $250 in cents
    rating: 4.9,
    reviewCount: 124,
    status: "APPROVED" as const,
    hospitalName: "NewYork-Presbyterian Hospital"
  },
  {
    user: { name: "Dr. Michael Chen", email: "michael.chen@example.com" },
    credentials: "Psychiatrist, MD",
    licenseNumber: "PSY-CA-67890",
    experience: 8,
    bio: "Dr. Michael Chen takes a holistic approach to mental health, combining medication management with psychotherapy.",
    specializations: ["ADHD", "Bipolar Disorder"],
    price60: 20000, // $200 in cents
    price90: 35000, // $350 in cents
    rating: 4.8,
    reviewCount: 89,
    status: "APPROVED" as const,
    hospitalName: "UCSF Medical Center"
  },
  {
    user: { name: "Ms. Emily Rodriguez", email: "emily.rodriguez@example.com" },
    credentials: "Family Therapist, LMFT",
    licenseNumber: "LMFT-TX-11223",
    experience: 6,
    bio: "Dedicated to helping couples and families improve communication and resolve conflicts.",
    specializations: ["Family Conflict", "Relationship Issues"],
    price60: 10000, // $100 in cents
    price90: 18000, // $180 in cents
    rating: 4.7,
    reviewCount: 65,
    status: "APPROVED" as const,
    hospitalName: "Dell Seton Medical Center"
  },

  // --- United Kingdom ---
  {
    user: { name: "Dr. Arthur Pendelton", email: "arthur.pendelton@example.com" },
    credentials: "Clinical Psychologist, DClinPsy",
    licenseNumber: "PSY-UK-44556",
    experience: 15,
    bio: "Specializing in cognitive behavioral therapy for professionals experiencing high stress.",
    specializations: ["Anxiety", "Work Stress"],
    price60: 14400, // £120 in cents (converted to USD equivalent for consistency)
    price90: 21600, // £180 in cents
    rating: 4.9,
    reviewCount: 40,
    status: "APPROVED" as const,
    hospitalName: "The London Clinic"
  },
  {
    user: { name: "Dr. Aisha Patel", email: "aisha.patel@example.com" },
    credentials: "Child Psychologist, PhD",
    licenseNumber: "PSY-UK-77889",
    experience: 12,
    bio: "Expert in child development and supporting neurodiverse children and their families.",
    specializations: ["Child Development", "Autism"],
    price60: 12000, // £100 in cents
    price90: 18000, // £150 in cents
    rating: 5.0,
    reviewCount: 110,
    status: "APPROVED" as const,
    hospitalName: "Manchester Royal Infirmary"
  },
  {
    user: { name: "Mr. Oliver Smith", email: "oliver.smith@example.com" },
    credentials: "Psychotherapist, MSc",
    licenseNumber: "PSY-UK-99001",
    experience: 7,
    bio: "Compassionate support for those navigating loss and difficult life transitions.",
    specializations: ["Depression", "Grief"],
    price60: 10800, // £90 in cents
    price90: 15600, // £130 in cents
    rating: 4.6,
    reviewCount: 25,
    status: "APPROVED" as const,
    hospitalName: "Royal Edinburgh Hospital"
  },

  // --- Somalia ---
  {
    user: { name: "Dr. Hassan Abdi", email: "hassan.abdi@example.com" },
    credentials: "Trauma Specialist, MD",
    licenseNumber: "PSY-SO-12345",
    experience: 20,
    bio: "Dr. Abdi is a renowned expert in trauma recovery, working with communities to heal from conflict and displacement.",
    specializations: ["Trauma", "PTSD", "Anxiety"],
    price60: 5000, // $50 in cents
    price90: 10000, // $100 in cents
    rating: 5.0,
    reviewCount: 82,
    status: "APPROVED" as const,
    hospitalName: "Banadir Hospital"
  },
  {
    user: { name: "Ms. Faduma Ali", email: "faduma.ali@example.com" },
    credentials: "Counseling Psychologist, MA",
    licenseNumber: "PSY-SO-23456",
    experience: 8,
    bio: "Providing a safe space for women and families to discuss mental health and social challenges.",
    specializations: ["Family Conflict", "Women's Issues"],
    price60: 4000, // $40 in cents
    price90: 8000, // $80 in cents
    rating: 4.8,
    reviewCount: 45,
    status: "APPROVED" as const,
    hospitalName: "Hargeisa Group Hospital"
  },
  {
    user: { name: "Dr. Ahmed Omar", email: "ahmed.omar@example.com" },
    credentials: "Clinical Psychiatrist, MD",
    licenseNumber: "PSY-SO-34567",
    experience: 15,
    bio: "Specializing in severe mental health disorders and community rehabilitation programs.",
    specializations: ["Depression", "Schizophrenia"],
    price60: 6000, // $60 in cents
    price90: 12000, // $120 in cents
    rating: 4.7,
    reviewCount: 30,
    status: "APPROVED" as const,
    hospitalName: "Garowe General Hospital"
  },

  // --- Kenya ---
  {
    user: { name: "Dr. Wangari Maathai", email: "wangari.maathai@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-KE-45678",
    experience: 18,
    bio: "Dr. Maathai is a leading psychologist in Nairobi, known for her empathetic approach and advocacy for mental wellness.",
    specializations: ["Anxiety", "Depression", "Stress"],
    price60: 3000, // KES 3000 converted (approximate USD $23)
    price90: 5000, // KES 5000 converted
    rating: 4.9,
    reviewCount: 150,
    status: "APPROVED" as const,
    hospitalName: "Aga Khan University Hospital"
  },
  {
    user: { name: "Mr. Jomo Kenyatta", email: "jomo.kenyatta@example.com" },
    credentials: "Addiction Counselor, MSW",
    licenseNumber: "PSY-KE-56789",
    experience: 10,
    bio: "Helping individuals overcome addiction through personalized counseling and support groups.",
    specializations: ["Addiction", "Substance Abuse"],
    price60: 2500, // KES 2500 converted
    price90: 4000, // KES 4000 converted
    rating: 4.7,
    reviewCount: 60,
    status: "APPROVED" as const,
    hospitalName: "Mombasa Hospital"
  },
  {
    user: { name: "Ms. Amani Njoroge", email: "amani.njoroge@example.com" },
    credentials: "Child Therapist, MA",
    licenseNumber: "PSY-KE-67890",
    experience: 6,
    bio: "Passionate about helping children navigate developmental challenges and school-related stress.",
    specializations: ["Child Development", "School Issues"],
    price60: 2000, // KES 2000 converted
    price90: 3500, // KES 3500 converted
    rating: 4.8,
    reviewCount: 40,
    status: "APPROVED" as const,
    hospitalName: "Kisumu Provincial Hospital"
  },

  // --- Turkey ---
  {
    user: { name: "Dr. Mehmet Yilmaz", email: "mehmet.yilmaz@example.com" },
    credentials: "Psychiatrist, MD",
    licenseNumber: "PSY-TR-78901",
    experience: 22,
    bio: "Dr. Yilmaz combines pharmacotherapy with psychotherapy to effectively treat mood and anxiety disorders.",
    specializations: ["Anxiety", "OCD", "Depression"],
    price60: 8000, // TRY 800 converted (approximate)
    price90: 15000, // TRY 1500 converted
    rating: 4.9,
    reviewCount: 200,
    status: "APPROVED" as const,
    hospitalName: "Acıbadem Hospital"
  },
  {
    user: { name: "Ms. Elif Demir", email: "elif.demir@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-TR-89012",
    experience: 9,
    bio: "Elif specializes in EMDR therapy for trauma and helps couples restore intimacy and trust.",
    specializations: ["Relationship Issues", "Trauma"],
    price60: 6000, // TRY 600 converted
    price90: 10000, // TRY 1000 converted
    rating: 4.8,
    reviewCount: 95,
    status: "APPROVED" as const,
    hospitalName: "Ankara City Hospital"
  },
  {
    user: { name: "Dr. Can Kaya", email: "can.kaya@example.com" },
    credentials: "Psychotherapist, MSc",
    licenseNumber: "PSY-TR-90123",
    experience: 7,
    bio: "Helping professionals manage workplace stress and burnout through cognitive behavioral techniques.",
    specializations: ["Stress", "Burnout"],
    price60: 5000, // TRY 500 converted
    price90: 9000, // TRY 900 converted
    rating: 4.7,
    reviewCount: 50,
    status: "APPROVED" as const,
    hospitalName: "Ege University Hospital"
  },

  // --- Saudi Arabia ---
  {
    user: { name: "Dr. Omar Al-Fayed", email: "omar.alfayed@example.com" },
    credentials: "Consultant Psychiatrist, MD",
    licenseNumber: "PSY-SA-01234",
    experience: 25,
    bio: "Leading psychiatrist in Riyadh with extensive experience in treating complex mood disorders.",
    specializations: ["Depression", "Anxiety", "Bipolar Disorder"],
    price60: 13300, // SAR 500 converted (approximate)
    price90: 24000, // SAR 900 converted
    rating: 5.0,
    reviewCount: 180,
    status: "APPROVED" as const,
    hospitalName: "King Faisal Specialist Hospital"
  },
  {
    user: { name: "Ms. Fatima Al-Saud", email: "fatima.alsaud@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-SA-12346",
    experience: 12,
    bio: "Specializing in family dynamics and child psychology, offering a culturally sensitive approach.",
    specializations: ["Family Conflict", "Child Development"],
    price60: 10600, // SAR 400 converted
    price90: 18600, // SAR 700 converted
    rating: 4.9,
    reviewCount: 110,
    status: "APPROVED" as const,
    hospitalName: "King Fahad General Hospital"
  },
  {
    user: { name: "Dr. Youssef Karim", email: "youssef.karim@example.com" },
    credentials: "Psychotherapist, MSc",
    licenseNumber: "PSY-SA-23457",
    experience: 6,
    bio: "Dedicated to helping young adults navigate life transitions and substance use challenges.",
    specializations: ["Addiction", "Stress"],
    price60: 9300, // SAR 350 converted
    price90: 16000, // SAR 600 converted
    rating: 4.6,
    reviewCount: 40,
    status: "APPROVED" as const,
    hospitalName: "Dammam Medical Complex"
  },

  // --- China ---
  {
    user: { name: "Dr. Wei Zhang", email: "wei.zhang@example.com" },
    credentials: "Psychiatrist, MD",
    licenseNumber: "PSY-CN-34568",
    experience: 15,
    bio: "Expert in treating sleep disorders and anxiety using a combination of TCM principles and modern psychiatry.",
    specializations: ["Anxiety", "Sleep Disorders"],
    price60: 7200, // ¥500 converted (approximate)
    price90: 11500, // ¥800 converted
    rating: 4.8,
    reviewCount: 90,
    status: "APPROVED" as const,
    hospitalName: "Peking Union Medical College Hospital"
  },
  {
    user: { name: "Ms. Li Na", email: "li.na@example.com" },
    credentials: "Counselor, MA",
    licenseNumber: "PSY-CN-45679",
    experience: 8,
    bio: "Helping professionals in high-pressure environments find balance and career satisfaction.",
    specializations: ["Stress", "Career Counseling"],
    price60: 5800, // ¥400 converted
    price90: 10100, // ¥700 converted
    rating: 4.7,
    reviewCount: 60,
    status: "APPROVED" as const,
    hospitalName: "Huashan Hospital"
  },
  {
    user: { name: "Dr. Chen Bo", email: "chen.bo@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-CN-56780",
    experience: 18,
    bio: "Cognitive behavioral therapy specialist for depression and PTSD.",
    specializations: ["Depression", "Trauma"],
    price60: 8700, // ¥600 converted
    price90: 14500, // ¥1000 converted
    rating: 4.9,
    reviewCount: 130,
    status: "APPROVED" as const,
    hospitalName: "Sun Yat-sen Memorial Hospital"
  },

  // --- India ---
  {
    user: { name: "Dr. Priya Sharma", email: "priya.sharma@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-IN-67891",
    experience: 14,
    bio: "Dr. Sharma is a renowned psychologist helping couples and individuals find harmony in their relationships and lives.",
    specializations: ["Anxiety", "Relationship Issues", "Depression"],
    price60: 1800, // ₹1500 converted (approximate)
    price90: 3000, // ₹2500 converted
    rating: 4.9,
    reviewCount: 210,
    status: "APPROVED" as const,
    hospitalName: "Kokilaben Dhirubhai Ambani Hospital"
  },
  {
    user: { name: "Dr. Rahul Verma", email: "rahul.verma@example.com" },
    credentials: "Psychiatrist, MD",
    licenseNumber: "PSY-IN-78902",
    experience: 20,
    bio: "Expert in managing severe mental health conditions with compassion and medical expertise.",
    specializations: ["Bipolar Disorder", "Schizophrenia"],
    price60: 2400, // ₹2000 converted
    price90: 4200, // ₹3500 converted
    rating: 4.8,
    reviewCount: 150,
    status: "APPROVED" as const,
    hospitalName: "All India Institute of Medical Sciences"
  },
  {
    user: { name: "Ms. Ananya Gupta", email: "ananya.gupta@example.com" },
    credentials: "Counselor, MA",
    licenseNumber: "PSY-IN-89013",
    experience: 6,
    bio: "Helping tech professionals manage burnout and stress.",
    specializations: ["Stress", "Work-Life Balance"],
    price60: 1440, // ₹1200 converted
    price90: 2400, // ₹2000 converted
    rating: 4.7,
    reviewCount: 80,
    status: "APPROVED" as const,
    hospitalName: "Manipal Hospital"
  },

  // --- Australia ---
  {
    user: { name: "Dr. Jack Thompson", email: "jack.thompson@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-AU-90124",
    experience: 12,
    bio: "Specializing in helping veterans and first responders recover from PTSD.",
    specializations: ["Trauma", "Anxiety"],
    price60: 13000, // $180 AUD converted (approximate)
    price90: 20200, // $280 AUD converted
    rating: 4.9,
    reviewCount: 95,
    status: "APPROVED" as const,
    hospitalName: "Royal Prince Alfred Hospital"
  },
  {
    user: { name: "Ms. Olivia Wilson", email: "olivia.wilson@example.com" },
    credentials: "Child Psychologist, MPsych",
    licenseNumber: "PSY-AU-01235",
    experience: 9,
    bio: "Works with children and schools to improve learning and behavioral outcomes.",
    specializations: ["Child Development", "Behavioral Issues"],
    price60: 11600, // $160 AUD converted
    price90: 17300, // $240 AUD converted
    rating: 4.8,
    reviewCount: 70,
    status: "APPROVED" as const,
    hospitalName: "The Alfred Hospital"
  },
  {
    user: { name: "Mr. Lucas Brown", email: "lucas.brown@example.com" },
    credentials: "Counselor, MSW",
    licenseNumber: "PSY-AU-12347",
    experience: 5,
    bio: "Supporting men in overcoming addiction and mental health stigma.",
    specializations: ["Addiction", "Men's Health"],
    price60: 8700, // $120 AUD converted
    price90: 13000, // $180 AUD converted
    rating: 4.6,
    reviewCount: 45,
    status: "APPROVED" as const,
    hospitalName: "Royal Brisbane and Women's Hospital"
  },

  // --- Brazil ---
  {
    user: { name: "Dr. Ana Silva", email: "ana.silva@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-BR-23458",
    experience: 11,
    bio: "Helping individuals build self-esteem and overcome body image issues.",
    specializations: ["Anxiety", "Body Image"],
    price60: 5700, // R$ 300 converted (approximate)
    price90: 9500, // R$ 500 converted
    rating: 4.9,
    reviewCount: 160,
    status: "APPROVED" as const,
    hospitalName: "Hospital Sírio-Libanês"
  },
  {
    user: { name: "Dr. Carlos Santos", email: "carlos.santos@example.com" },
    credentials: "Psychoanalyst, MD",
    licenseNumber: "PSY-BR-34569",
    experience: 20,
    bio: "Specializing in Lacanian psychoanalysis for deep personal exploration.",
    specializations: ["Depression", "Existential Crisis"],
    price60: 7600, // R$ 400 converted
    price90: 11400, // R$ 600 converted
    rating: 4.8,
    reviewCount: 100,
    status: "APPROVED" as const,
    hospitalName: "Copa D'Or Hospital"
  },
  {
    user: { name: "Ms. Julia Costa", email: "julia.costa@example.com" },
    credentials: "Family Therapist, MSc",
    licenseNumber: "PSY-BR-45670",
    experience: 8,
    bio: "Supporting families through divorce and restructuring.",
    specializations: ["Family Conflict", "Divorce"],
    price60: 4750, // R$ 250 converted
    price90: 7600, // R$ 400 converted
    rating: 4.7,
    reviewCount: 55,
    status: "APPROVED" as const,
    hospitalName: "Hospital de Base do Distrito Federal"
  },

  // --- Germany ---
  {
    user: { name: "Dr. Hans Müller", email: "hans.muller@example.com" },
    credentials: "Psychiatrist, MD",
    licenseNumber: "PSY-DE-56781",
    experience: 16,
    bio: "Dr. Müller specializes in the treatment of anxiety and obsessive-compulsive disorders.",
    specializations: ["Anxiety", "Depression", "OCD"],
    price60: 11000, // €100 converted (approximate)
    price90: 17600, // €160 converted
    rating: 4.9,
    reviewCount: 85,
    status: "APPROVED" as const,
    hospitalName: "Charité - Universitätsmedizin Berlin"
  },
  {
    user: { name: "Ms. Lena Weber", email: "lena.weber@example.com" },
    credentials: "Psychotherapist, Diplom",
    licenseNumber: "PSY-DE-67892",
    experience: 8,
    bio: "Helping individuals navigate life transitions with clarity and resilience.",
    specializations: ["Stress", "Life Transitions"],
    price60: 9900, // €90 converted
    price90: 15400, // €140 converted
    rating: 4.8,
    reviewCount: 60,
    status: "APPROVED" as const,
    hospitalName: "Klinikum der Universität München"
  },
  {
    user: { name: "Dr. Klaus Fischer", email: "klaus.fischer@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-DE-78903",
    experience: 12,
    bio: "Expert in trauma therapy and EMDR.",
    specializations: ["Trauma", "PTSD"],
    price60: 12100, // €110 converted
    price90: 16500, // €150 converted
    rating: 4.7,
    reviewCount: 45,
    status: "APPROVED" as const,
    hospitalName: "University Medical Center Hamburg-Eppendorf"
  },

  // --- France ---
  {
    user: { name: "Dr. Camille Laurent", email: "camille.laurent@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-FR-89014",
    experience: 14,
    bio: "Dr. Laurent offers a safe space for exploring relationship dynamics and personal growth.",
    specializations: ["Relationship Issues", "Anxiety"],
    price60: 9900, // €90 converted
    price90: 16500, // €150 converted
    rating: 4.9,
    reviewCount: 95,
    status: "APPROVED" as const,
    hospitalName: "Hôpital Pitié-Salpêtrière"
  },
  {
    user: { name: "Mr. Thomas Dubois", email: "thomas.dubois@example.com" },
    credentials: "Psychoanalyst, MD",
    licenseNumber: "PSY-FR-90125",
    experience: 10,
    bio: "Providing psychoanalytic therapy for self-discovery and healing.",
    specializations: ["Depression", "Self-Esteem"],
    price60: 8800, // €80 converted
    price90: 13200, // €120 converted
    rating: 4.7,
    reviewCount: 50,
    status: "APPROVED" as const,
    hospitalName: "Hospices Civils de Lyon"
  },
  {
    user: { name: "Ms. Sophie Moreau", email: "sophie.moreau@example.com" },
    credentials: "Child Psychologist, PhD",
    licenseNumber: "PSY-FR-01236",
    experience: 7,
    bio: "Supporting children and adolescents with behavioral and school-related challenges.",
    specializations: ["Child Development", "School Issues"],
    price60: 7700, // €70 converted
    price90: 12100, // €110 converted
    rating: 4.8,
    reviewCount: 70,
    status: "APPROVED" as const,
    hospitalName: "Hôpital de la Timone"
  },

  // --- Japan ---
  {
    user: { name: "Dr. Kenji Tanaka", email: "kenji.tanaka@example.com" },
    credentials: "Psychiatrist, MD",
    licenseNumber: "PSY-JP-12348",
    experience: 20,
    bio: "Specializing in workplace mental health and treating burnout in professionals.",
    specializations: ["Work Stress", "Depression"],
    price60: 7200, // ¥10,000 converted (approximate)
    price90: 10800, // ¥15,000 converted
    rating: 4.9,
    reviewCount: 110,
    status: "APPROVED" as const,
    hospitalName: "The University of Tokyo Hospital"
  },
  {
    user: { name: "Ms. Yumi Yamamoto", email: "yumi.yamamoto@example.com" },
    credentials: "Counselor, MA",
    licenseNumber: "PSY-JP-23459",
    experience: 10,
    bio: "Helping individuals overcome social anxiety and build confidence.",
    specializations: ["Anxiety", "Social Phobia"],
    price60: 5800, // ¥8,000 converted
    price90: 8700, // ¥12,000 converted
    rating: 4.8,
    reviewCount: 80,
    status: "APPROVED" as const,
    hospitalName: "Osaka University Hospital"
  },
  {
    user: { name: "Dr. Hiroshi Sato", email: "hiroshi.sato@example.com" },
    credentials: "Clinical Psychologist, PhD",
    licenseNumber: "PSY-JP-34560",
    experience: 15,
    bio: "Supporting families dealing with aging and intergenerational conflict.",
    specializations: ["Family Conflict", "Elderly Care"],
    price60: 6500, // ¥9,000 converted
    price90: 9400, // ¥13,000 converted
    rating: 4.7,
    reviewCount: 50,
    status: "APPROVED" as const,
    hospitalName: "Kyoto University Hospital"
  }
];
