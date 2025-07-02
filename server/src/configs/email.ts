import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config()
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const { to, subject, html, from = process.env.FROM_EMAIL || 'noreply@learnerlicense.com' } = options;

    if (process.env.NODE_ENV === 'development') {
      // In development, log emails to console instead of sending
      console.log('📧 Email would be sent:');
      console.log(`From: ${from}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html}`);
      return;
    }

    await resend.emails.send({
      from,
      to,
      subject,
      html
    });

    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export { resend };