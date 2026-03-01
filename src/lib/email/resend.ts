import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const EMAIL_FROM = process.env.EMAIL_FROM || 'HealTalk <noreply@healtalk.com>';
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@healtalk.com';

// Email sending helper with error handling
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo = EMAIL_REPLY_TO,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  try {
    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
      replyTo,
    });

    if (response.error) {
      console.error('Failed to send email:', response.error);
      throw new Error(`Email sending failed: ${response.error.message}`);
    }

    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
