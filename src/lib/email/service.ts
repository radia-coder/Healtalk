import { sendEmail } from "@/lib/email";
import * as templates from './templates';

// Email service for sending various notification emails

export class EmailService {
  // Welcome emails
  static async sendWelcomePatient(email: string, name: string) {
    const { subject, html, text } = templates.welcomePatientEmail(name);
    return sendEmail({ to: email, subject, html, text });
  }

  static async sendWelcomePsychologist(email: string, name: string) {
    const { subject, html, text } = templates.welcomePsychologistEmail(name);
    return sendEmail({ to: email, subject, html, text });
  }

  // Psychologist approval/rejection
  static async sendPsychologistApproved(email: string, name: string) {
    const { subject, html, text } = templates.psychologistApprovedEmail(name);
    return sendEmail({ to: email, subject, html, text });
  }

  static async sendPsychologistRejected(email: string, name: string, reason: string) {
    const { subject, html, text } = templates.psychologistRejectedEmail(name, reason);
    return sendEmail({ to: email, subject, html, text });
  }

  // Appointment emails
  static async sendAppointmentConfirmation(
    patientEmail: string,
    data: {
      patientName: string;
      psychologistName: string;
      date: string;
      time: string;
      duration: number;
      price: string;
      appointmentId: string;
    }
  ) {
    const { subject, html, text } = templates.appointmentConfirmationEmail(data);
    return sendEmail({ to: patientEmail, subject, html, text });
  }

  static async send24hReminder(
    patientEmail: string,
    data: {
      patientName: string;
      psychologistName: string;
      date: string;
      time: string;
      appointmentId: string;
    }
  ) {
    const { subject, html, text } = templates.appointment24hReminderEmail(data);
    return sendEmail({ to: patientEmail, subject, html, text });
  }

  static async send1hReminder(
    patientEmail: string,
    data: {
      patientName: string;
      psychologistName: string;
      time: string;
      appointmentId: string;
    }
  ) {
    const { subject, html, text } = templates.appointment1hReminderEmail(data);
    return sendEmail({ to: patientEmail, subject, html, text });
  }

  static async sendAppointmentCancelled(
    recipientEmail: string,
    data: {
      recipientName: string;
      psychologistName: string;
      date: string;
      time: string;
      cancelledBy: 'patient' | 'psychologist';
      refundAmount?: string;
    }
  ) {
    const { subject, html, text } = templates.appointmentCancelledEmail(data);
    return sendEmail({ to: recipientEmail, subject, html, text });
  }

  // Password reset
  static async sendPasswordReset(email: string, name: string, resetToken: string) {
    const { subject, html, text } = templates.passwordResetEmail(name, resetToken);
    return sendEmail({ to: email, subject, html, text });
  }

  // New message notification
  static async sendNewMessage(
    recipientEmail: string,
    data: {
      recipientName: string;
      senderName: string;
      messagePreview: string;
      conversationId: string;
    }
  ) {
    const { subject, html, text } = templates.newMessageEmail(data);
    return sendEmail({ to: recipientEmail, subject, html, text });
  }
}

// Helper function to format date for emails
export function formatEmailDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper function to format time for emails
export function formatEmailTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Helper function to format price
export function formatEmailPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
