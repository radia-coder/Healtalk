import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VideoCall } from "@/components/video/VideoCall";

interface CallPageProps {
  params: Promise<{ appointmentId: string }>;
}

export default async function CallPage({ params }: CallPageProps) {
  const { appointmentId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!appointmentId) {
    redirect("/patient/dashboard/appointments");
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { userId: true, user: { select: { name: true } } } },
      psychologist: {
        select: { userId: true, user: { select: { name: true } } },
      },
    },
  });

  if (!appointment) {
    redirect("/login");
  }

  const isParticipant =
    appointment.patient?.userId === session.user.id ||
    appointment.psychologist?.userId === session.user.id;

  if (!isParticipant) {
    redirect("/login");
  }

  const displayName = session.user.name || "HealTalk User";

  return (
    <div className="fixed inset-0 z-40">
      <VideoCall
        appointmentId={appointment.id}
        userAccount={session.user.id}
        userName={displayName}
      />
    </div>
  );
}
