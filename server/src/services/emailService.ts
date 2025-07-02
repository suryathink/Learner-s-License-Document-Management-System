import dotenv from 'dotenv';
import {sendEmail} from "../configs/email";
import { ISubmission } from '../models/Submission';
import {
  getAdminNotificationTemplate,
  getApplicantConfirmationTemplate,
  getStatusUpdateTemplate
} from '../helpers/emailTemplates';

dotenv.config()

class EmailService {
  async sendAdminNotification(submission: ISubmission): Promise<void> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnerlicense.com';
      const subject = `New Learner's License Application - ${submission.submissionId}`;
      const html = getAdminNotificationTemplate(submission);

      await sendEmail({
        to: adminEmail,
        subject,
        html
      });

      console.log(`✅ Admin notification sent for submission: ${submission.submissionId}`);
    } catch (error) {
      console.error('Error sending admin notification:', error);
      // Don't throw error to prevent blocking submission creation
    }
  }

  async sendApplicantConfirmation(submission: ISubmission): Promise<void> {
    try {
      const subject = `Application Confirmation - ${submission.submissionId}`;
      const html = getApplicantConfirmationTemplate(submission);

      await sendEmail({
        to: submission.email,
        subject,
        html
      });

      console.log(`✅ Confirmation email sent to: ${submission.email}`);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw error to prevent blocking submission creation
    }
  }

  async sendStatusUpdate(
    submission: ISubmission,
    status: string,
    notes?: string
  ): Promise<void> {
    try {
      const statusTexts = {
        approved: 'Approved',
        rejected: 'Rejected',
        pending: 'Under Review'
      };

      const subject = `Application ${statusTexts[status as keyof typeof statusTexts]} - ${submission.submissionId}`;
      const html = getStatusUpdateTemplate(submission, status, notes);

      await sendEmail({
        to: submission.email,
        subject,
        html
      });

      console.log(`✅ Status update email sent to: ${submission.email} (${status})`);
    } catch (error) {
      console.error('Error sending status update email:', error);
      // Don't throw error to prevent blocking status update
    }
  }

  async sendBulkNotification(
    recipients: string[],
    subject: string,
    htmlTemplate: string
  ): Promise<void> {
    try {
      const emailPromises = recipients.map(email =>
        sendEmail({
          to: email,
          subject,
          html: htmlTemplate
        })
      );

      await Promise.allSettled(emailPromises);
      console.log(`✅ Bulk notification sent to ${recipients.length} recipients`);
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      throw new Error('Failed to send bulk notification');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password?token=${resetToken}`;
      const subject = 'Admin Password Reset Request';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 15px 0; }
                .warning { background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
                <p>A password reset has been requested for your admin account.</p>
                
                <p>If you requested this reset, click the button below to set a new password:</p>
                
                <p style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </p>
                
                <div class="warning">
                    <p><strong>Security Notice:</strong></p>
                    <ul>
                        <li>This link will expire in 1 hour</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>For security, please use a strong password</li>
                    </ul>
                </div>
                
                <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: email,
        subject,
        html
      });

      console.log(`✅ Password reset email sent to: ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

export const emailService = new EmailService();