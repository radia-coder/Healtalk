// Email template helpers and reusable components

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const BRAND_COLOR = '#4A90A4'; // HealTalk primary color

// Base email layout
function emailLayout(content: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HealTalk</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header {
            background-color: ${BRAND_COLOR};
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: ${BRAND_COLOR};
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .footer a {
            color: ${BRAND_COLOR};
            text-decoration: none;
          }
          .info-box {
            background-color: #f9f9f9;
            border-left: 4px solid ${BRAND_COLOR};
            padding: 15px;
            margin: 20px 0;
          }
          .warning-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
          .success-box {
            background-color: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧠 HealTalk</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>HealTalk - Private, supportive therapy on your schedule</p>
            <p>
              <a href="${APP_URL}/privacy">Privacy Policy</a> •
              <a href="${APP_URL}/terms">Terms of Service</a> •
              <a href="${APP_URL}/hipaa">HIPAA Notice</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} HealTalk. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Welcome email for new patients
export function welcomePatientEmail(name: string) {
  const content = `
    <h2>Welcome to HealTalk, ${name}! 👋</h2>
    <p>We're so glad you're here. Taking the first step towards better mental health is courageous, and we're honored to support you on this journey.</p>

    <div class="info-box">
      <strong>Here's what you can do next:</strong>
      <ul>
        <li>Browse our licensed psychologists and find your perfect match</li>
        <li>Take our free AI mental health screening</li>
        <li>Book your first consultation at a time that works for you</li>
        <li>Send a message to your psychologist before your session</li>
      </ul>
    </div>

    <p style="text-align: center;">
      <a href="${APP_URL}/find-psychologists" class="button">Find Your Psychologist</a>
    </p>

    <p style="margin-top: 30px;">If you have any questions, our support team is here to help at <a href="mailto:support@healtalk.com">support@healtalk.com</a>.</p>

    <p>Warm regards,<br>The HealTalk Team</p>
  `;

  return {
    subject: 'Welcome to HealTalk - Your Mental Health Journey Starts Here',
    html: emailLayout(content),
    text: `Welcome to HealTalk, ${name}!\n\nWe're so glad you're here. Taking the first step towards better mental health is courageous, and we're honored to support you on this journey.\n\nVisit ${APP_URL}/find-psychologists to find your perfect psychologist match.\n\nBest regards,\nThe HealTalk Team`
  };
}

// Welcome email for new psychologists
export function welcomePsychologistEmail(name: string) {
  const content = `
    <h2>Welcome to HealTalk, Dr. ${name}! 🎉</h2>
    <p>Thank you for joining our platform. Your application is currently under review.</p>

    <div class="info-box">
      <strong>What happens next:</strong>
      <ol>
        <li>We'll verify your credentials and license information (typically within 2-3 business days)</li>
        <li>You'll receive an email notification once approved</li>
        <li>You can then set your availability and start accepting patients</li>
      </ol>
    </div>

    <div class="warning-box">
      <strong>Required Documents:</strong><br>
      Please ensure you've uploaded all required credentials. Missing documents may delay your approval.
    </div>

    <p style="margin-top: 30px;">If you have questions, contact us at <a href="mailto:support@healtalk.com">support@healtalk.com</a>.</p>

    <p>Best regards,<br>The HealTalk Team</p>
  `;

  return {
    subject: 'Welcome to HealTalk - Application Under Review',
    html: emailLayout(content),
    text: `Welcome to HealTalk, Dr. ${name}!\n\nYour application is currently under review. We'll verify your credentials and notify you within 2-3 business days.\n\nBest regards,\nThe HealTalk Team`
  };
}

// Psychologist approved
export function psychologistApprovedEmail(name: string) {
  const content = `
    <h2>🎉 Congratulations, Dr. ${name}!</h2>
    <p>Your HealTalk account has been approved. You can now start accepting patients and providing consultations.</p>

    <div class="success-box">
      <strong>Your account is now active!</strong><br>
      Start by setting your availability and completing your profile.
    </div>

    <p style="text-align: center;">
      <a href="${APP_URL}/psychologist/dashboard" class="button">Go to Dashboard</a>
    </p>

    <div class="info-box">
      <strong>Next steps:</strong>
      <ul>
        <li>Set your weekly availability</li>
        <li>Complete your profile and bio</li>
        <li>Set your session pricing</li>
        <li>Start accepting appointments!</li>
      </ul>
    </div>

    <p style="margin-top: 30px;">Need help getting started? Contact us at <a href="mailto:support@healtalk.com">support@healtalk.com</a>.</p>

    <p>Welcome aboard!<br>The HealTalk Team</p>
  `;

  return {
    subject: '🎉 Your HealTalk Account is Approved!',
    html: emailLayout(content),
    text: `Congratulations, Dr. ${name}!\n\nYour HealTalk account has been approved. You can now start accepting patients.\n\nVisit ${APP_URL}/psychologist/dashboard to get started.\n\nBest regards,\nThe HealTalk Team`
  };
}

// Psychologist rejected
export function psychologistRejectedEmail(name: string, reason: string) {
  const content = `
    <h2>Update on Your HealTalk Application</h2>
    <p>Dear Dr. ${name},</p>
    <p>Thank you for your interest in joining HealTalk. Unfortunately, we're unable to approve your application at this time.</p>

    <div class="warning-box">
      <strong>Reason:</strong><br>
      ${reason}
    </div>

    <p>If you believe this decision was made in error or would like to reapply after addressing the concerns, please contact us at <a href="mailto:support@healtalk.com">support@healtalk.com</a>.</p>

    <p>Best regards,<br>The HealTalk Team</p>
  `;

  return {
    subject: 'Update on Your HealTalk Application',
    html: emailLayout(content),
    text: `Dear Dr. ${name},\n\nThank you for your interest in HealTalk. Unfortunately, we're unable to approve your application at this time.\n\nReason: ${reason}\n\nIf you have questions, contact us at support@healtalk.com.\n\nBest regards,\nThe HealTalk Team`
  };
}

// Appointment confirmation
export function appointmentConfirmationEmail(data: {
  patientName: string;
  psychologistName: string;
  date: string;
  time: string;
  duration: number;
  price: string;
  appointmentId: string;
}) {
  const content = `
    <h2>Appointment Confirmed ✅</h2>
    <p>Hi ${data.patientName},</p>
    <p>Your appointment with <strong>Dr. ${data.psychologistName}</strong> has been confirmed!</p>

    <div class="info-box">
      <strong>Appointment Details:</strong><br>
      📅 <strong>Date:</strong> ${data.date}<br>
      ⏰ <strong>Time:</strong> ${data.time}<br>
      ⏱️ <strong>Duration:</strong> ${data.duration} minutes<br>
      💳 <strong>Amount Paid:</strong> ${data.price}
    </div>

    <div class="warning-box">
      <strong>Before Your Session:</strong><br>
      • Test your camera and microphone<br>
      • Find a quiet, private space<br>
      • Prepare any topics you'd like to discuss<br>
      • You'll receive reminder emails 24 hours and 1 hour before your session
    </div>

    <p style="text-align: center;">
      <a href="${APP_URL}/patient/dashboard/appointments" class="button">View Appointment</a>
    </p>

    <p style="margin-top: 30px;"><strong>Need to reschedule?</strong><br>
    Cancel at least 24 hours in advance for a full refund.</p>

    <p>Looking forward to your session!<br>The HealTalk Team</p>
  `;

  return {
    subject: `Appointment Confirmed with Dr. ${data.psychologistName}`,
    html: emailLayout(content),
    text: `Hi ${data.patientName},\n\nYour appointment with Dr. ${data.psychologistName} is confirmed!\n\nDate: ${data.date}\nTime: ${data.time}\nDuration: ${data.duration} minutes\nAmount Paid: ${data.price}\n\nView details: ${APP_URL}/patient/dashboard/appointments\n\nBest regards,\nThe HealTalk Team`
  };
}

// 24-hour reminder
export function appointment24hReminderEmail(data: {
  patientName: string;
  psychologistName: string;
  date: string;
  time: string;
  appointmentId: string;
}) {
  const content = `
    <h2>Reminder: Appointment Tomorrow</h2>
    <p>Hi ${data.patientName},</p>
    <p>This is a friendly reminder that you have an appointment with <strong>Dr. ${data.psychologistName}</strong> tomorrow.</p>

    <div class="info-box">
      <strong>Appointment Details:</strong><br>
      📅 <strong>Date:</strong> ${data.date}<br>
      ⏰ <strong>Time:</strong> ${data.time}
    </div>

    <p style="text-align: center;">
      <a href="${APP_URL}/patient/dashboard/appointments" class="button">View Appointment</a>
    </p>

    <p style="margin-top: 30px;"><strong>Need to cancel?</strong><br>
    Please cancel at least 24 hours before your appointment to receive a full refund.</p>

    <p>See you tomorrow!<br>The HealTalk Team</p>
  `;

  return {
    subject: `Reminder: Appointment Tomorrow with Dr. ${data.psychologistName}`,
    html: emailLayout(content),
    text: `Hi ${data.patientName},\n\nReminder: You have an appointment with Dr. ${data.psychologistName} tomorrow at ${data.time}.\n\nView details: ${APP_URL}/patient/dashboard/appointments\n\nBest regards,\nThe HealTalk Team`
  };
}

// 1-hour reminder
export function appointment1hReminderEmail(data: {
  patientName: string;
  psychologistName: string;
  time: string;
  appointmentId: string;
}) {
  const content = `
    <h2>⏰ Appointment Starting Soon</h2>
    <p>Hi ${data.patientName},</p>
    <p>Your appointment with <strong>Dr. ${data.psychologistName}</strong> starts in 1 hour!</p>

    <div class="warning-box">
      <strong>Quick Checklist:</strong><br>
      ✅ Test your camera and microphone<br>
      ✅ Find a quiet, private space<br>
      ✅ Have a glass of water nearby<br>
      ✅ Close other apps to ensure good connection
    </div>

    <p style="text-align: center;">
      <a href="${APP_URL}/shared/call/session/${data.appointmentId}" class="button">Join Session</a>
    </p>

    <p style="margin-top: 30px;">You can join the call up to 5 minutes early.</p>

    <p>See you soon!<br>The HealTalk Team</p>
  `;

  return {
    subject: `🔔 Appointment in 1 Hour with Dr. ${data.psychologistName}`,
    html: emailLayout(content),
    text: `Hi ${data.patientName},\n\nYour appointment with Dr. ${data.psychologistName} starts in 1 hour at ${data.time}!\n\nJoin session: ${APP_URL}/shared/call/session/${data.appointmentId}\n\nBest regards,\nThe HealTalk Team`
  };
}

// Appointment cancelled
export function appointmentCancelledEmail(data: {
  recipientName: string;
  psychologistName: string;
  date: string;
  time: string;
  cancelledBy: 'patient' | 'psychologist';
  refundAmount?: string;
}) {
  const cancelledByText = data.cancelledBy === 'patient' ? 'you' : `Dr. ${data.psychologistName}`;

  const content = `
    <h2>Appointment Cancelled</h2>
    <p>Hi ${data.recipientName},</p>
    <p>Your appointment with <strong>Dr. ${data.psychologistName}</strong> has been cancelled by ${cancelledByText}.</p>

    <div class="info-box">
      <strong>Cancelled Appointment:</strong><br>
      📅 <strong>Date:</strong> ${data.date}<br>
      ⏰ <strong>Time:</strong> ${data.time}
    </div>

    ${data.refundAmount ? `
      <div class="success-box">
        <strong>Refund:</strong> ${data.refundAmount} will be refunded to your original payment method within 5-7 business days.
      </div>
    ` : ''}

    <p style="text-align: center;">
      <a href="${APP_URL}/find-psychologists" class="button">Book Another Appointment</a>
    </p>

    <p style="margin-top: 30px;">If you have questions, contact us at <a href="mailto:support@healtalk.com">support@healtalk.com</a>.</p>

    <p>Best regards,<br>The HealTalk Team</p>
  `;

  return {
    subject: `Appointment Cancelled - ${data.date} at ${data.time}`,
    html: emailLayout(content),
    text: `Hi ${data.recipientName},\n\nYour appointment with Dr. ${data.psychologistName} on ${data.date} at ${data.time} has been cancelled by ${cancelledByText}.\n\n${data.refundAmount ? `Refund: ${data.refundAmount} will be processed within 5-7 business days.\n\n` : ''}Best regards,\nThe HealTalk Team`
  };
}

// Password reset
export function passwordResetEmail(name: string, resetToken: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  const content = `
    <h2>Reset Your Password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your HealTalk password. Click the button below to create a new password:</p>

    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>

    <div class="warning-box">
      <strong>Security Notice:</strong><br>
      • This link expires in 1 hour<br>
      • If you didn't request this, please ignore this email<br>
      • Never share this link with anyone
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #666;">
      Or copy and paste this URL into your browser:<br>
      <a href="${resetUrl}">${resetUrl}</a>
    </p>

    <p>Best regards,<br>The HealTalk Team</p>
  `;

  return {
    subject: 'Reset Your HealTalk Password',
    html: emailLayout(content),
    text: `Hi ${name},\n\nWe received a request to reset your HealTalk password.\n\nClick here to reset: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, please ignore this email.\n\nBest regards,\nThe HealTalk Team`
  };
}

// New message notification
export function newMessageEmail(data: {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationId: string;
}) {
  const content = `
    <h2>New Message from ${data.senderName}</h2>
    <p>Hi ${data.recipientName},</p>
    <p>You have a new message from <strong>${data.senderName}</strong>:</p>

    <div class="info-box" style="font-style: italic;">
      "${data.messagePreview.substring(0, 150)}${data.messagePreview.length > 150 ? '...' : ''}"
    </div>

    <p style="text-align: center;">
      <a href="${APP_URL}/patient/dashboard/messages" class="button">Read Message</a>
    </p>

    <p style="margin-top: 30px; font-size: 14px; color: #666;">
      To manage your notification preferences, visit your account settings.
    </p>

    <p>Best regards,<br>The HealTalk Team</p>
  `;

  return {
    subject: `New message from ${data.senderName}`,
    html: emailLayout(content),
    text: `Hi ${data.recipientName},\n\nYou have a new message from ${data.senderName}:\n\n"${data.messagePreview}"\n\nRead it here: ${APP_URL}/patient/dashboard/messages\n\nBest regards,\nThe HealTalk Team`
  };
}
