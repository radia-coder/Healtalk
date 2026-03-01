import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding test data for sessions and screening...");

  // Find existing users
  const psychologist = await prisma.user.findFirst({
    where: { role: "PSYCHOLOGIST" },
    include: { psychologist: true },
  });

  const patient = await prisma.user.findFirst({
    where: { role: "PATIENT" },
    include: { patient: true },
  });

  if (!psychologist || !patient) {
    console.error("❌ No psychologist or patient found. Please create users first.");
    return;
  }

  console.log(`✅ Found psychologist: ${psychologist.email}`);
  console.log(`✅ Found patient: ${patient.email}`);

  // Create therapy sessions
  console.log("\n📅 Creating therapy sessions...");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 0, 0, 0);

  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  twoWeeks.setHours(15, 0, 0, 0);

  const session1 = await prisma.therapySession.create({
    data: {
      psychologistId: psychologist.psychologist!.id,
      title: "Anxiety Support Group",
      description:
        "A supportive space for individuals dealing with anxiety. We'll discuss coping strategies, share experiences, and learn from each other.",
      type: "GROUP",
      maxParticipants: 6,
      date: tomorrow,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      duration: 60,
      pricePerPerson: 3500, // $35
      status: "SCHEDULED",
    },
  });
  console.log(`✅ Created session: ${session1.title}`);

  const session2 = await prisma.therapySession.create({
    data: {
      psychologistId: psychologist.psychologist!.id,
      title: "Mindfulness & Meditation",
      description:
        "Learn practical mindfulness techniques to reduce stress and increase present-moment awareness. Perfect for beginners and experienced practitioners.",
      type: "GROUP",
      maxParticipants: 8,
      date: nextWeek,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 90 * 60 * 1000),
      duration: 90,
      pricePerPerson: 5000, // $50
      status: "SCHEDULED",
    },
  });
  console.log(`✅ Created session: ${session2.title}`);

  const session3 = await prisma.therapySession.create({
    data: {
      psychologistId: psychologist.psychologist!.id,
      title: "Depression Recovery Workshop",
      description:
        "A therapeutic workshop focusing on understanding depression, building resilience, and developing healthy coping mechanisms.",
      type: "GROUP",
      maxParticipants: 5,
      date: twoWeeks,
      startTime: twoWeeks,
      endTime: new Date(twoWeeks.getTime() + 60 * 60 * 1000),
      duration: 60,
      pricePerPerson: 4000, // $40
      status: "SCHEDULED",
    },
  });
  console.log(`✅ Created session: ${session3.title}`);

  // Add patient to first session
  if (patient.patient) {
    await prisma.sessionParticipant.create({
      data: {
        sessionId: session1.id,
        patientId: patient.patient.id,
        status: "REGISTERED",
      },
    });
    console.log(`✅ Registered patient for: ${session1.title}`);
  }

  // Create screening assessments
  console.log("\n🧠 Creating screening assessments...");

  if (patient.patient) {
    await prisma.screeningAssessment.create({
      data: {
        patientId: patient.patient.id,
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        responses: [
          { role: "user", content: "I've been feeling anxious lately" },
          { role: "assistant", content: "I understand. Can you tell me more about when you feel most anxious?" },
          { role: "user", content: "Mostly at work and in social situations" },
          { role: "assistant", content: "How has this been affecting your daily life?" },
          { role: "user", content: "I've been avoiding social events and having trouble sleeping" },
        ],
        aiSummary:
          "The patient reports moderate anxiety symptoms affecting work and social life. Sleep disturbances and avoidance behaviors are present. Therapy is recommended to develop coping strategies and address underlying anxiety triggers.",
        riskLevel: "MEDIUM",
        recommendedActions: [
          "Schedule appointment with therapist",
          "Practice relaxation techniques",
          "Consider joining anxiety support group",
        ],
      },
    });
    console.log(`✅ Created assessment (MEDIUM risk) from 7 days ago`);

    await prisma.screeningAssessment.create({
      data: {
        patientId: patient.patient.id,
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        responses: [
          { role: "user", content: "I've been feeling down but I think I'm managing okay" },
          { role: "assistant", content: "It's good that you're managing. Can you describe your mood lately?" },
          { role: "user", content: "A bit low sometimes, but I still enjoy my hobbies" },
        ],
        aiSummary:
          "The patient reports mild depressive symptoms but maintains engagement with activities. Overall functioning appears intact. Therapy could benefit personal growth and stress management.",
        riskLevel: "LOW",
        recommendedActions: [
          "Consider therapy for personal growth",
          "Maintain healthy lifestyle habits",
          "Monitor mood changes",
        ],
      },
    });
    console.log(`✅ Created assessment (LOW risk) from 30 days ago`);
  }

  console.log("\n✨ Seed data created successfully!");
  console.log("\n📝 Test Instructions:");
  console.log("1. Log in as psychologist to manage sessions");
  console.log("2. Log in as patient to join sessions and view screening");
  console.log(`3. Psychologist email: ${psychologist.email}`);
  console.log(`4. Patient email: ${patient.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
