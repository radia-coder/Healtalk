import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService, formatEmailDate, formatEmailTime } from '@/lib/email/service';

// This should be called by a cron job every hour
// Vercel Cron: https://vercel.com/docs/cron-jobs
// Or use an external service like cron-job.org

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Find appointments needing 24h reminder
    const appointments24h = await prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        startTime: {
          gte: in24Hours,
          lte: new Date(in24Hours.getTime() + 60 * 60 * 1000), // Within 1 hour window
        },
        reminder24hSentAt: null,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        psychologist: {
          include: {
            user: true,
          },
        },
      },
    });

    // Send 24h reminders
    const sent24h: string[] = [];
    for (const appointment of appointments24h) {
      try {
        await EmailService.send24hReminder(appointment.patient.user.email, {
          patientName: appointment.patient.user.name,
          psychologistName: appointment.psychologist.user.name,
          date: formatEmailDate(appointment.startTime),
          time: formatEmailTime(appointment.startTime),
          appointmentId: appointment.id,
        });

        // Mark as sent
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { reminder24hSentAt: now },
        });

        sent24h.push(appointment.id);
      } catch (error) {
        console.error(`Failed to send 24h reminder for appointment ${appointment.id}:`, error);
      }
    }

    // Find appointments needing 1h reminder
    const appointments1h = await prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        startTime: {
          gte: in1Hour,
          lte: in2Hours, // Within 1 hour window
        },
        reminder1hSentAt: null,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        psychologist: {
          include: {
            user: true,
          },
        },
      },
    });

    // Send 1h reminders
    const sent1h: string[] = [];
    for (const appointment of appointments1h) {
      try {
        await EmailService.send1hReminder(appointment.patient.user.email, {
          patientName: appointment.patient.user.name,
          psychologistName: appointment.psychologist.user.name,
          time: formatEmailTime(appointment.startTime),
          appointmentId: appointment.id,
        });

        // Mark as sent
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { reminder1hSentAt: now },
        });

        sent1h.push(appointment.id);
      } catch (error) {
        console.error(`Failed to send 1h reminder for appointment ${appointment.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      sent24hReminders: sent24h.length,
      sent1hReminders: sent1h.length,
      details: {
        sent24h,
        sent1h,
      },
    });
  } catch (error) {
    console.error('Error in send-reminders cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
