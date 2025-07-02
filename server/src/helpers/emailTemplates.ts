import { formatDate } from './utils';

export const getAdminNotificationTemplate = (submissionData: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Learner's License Application</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-row { margin: 10px 0; padding: 8px; background-color: white; border-radius: 4px; }
            .label { font-weight: bold; color: #666; }
            .value { margin-left: 10px; }
            .footer { margin-top: 20px; padding: 15px; background-color: #e9e9e9; text-align: center; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚗 New Learner's License Application</h1>
        </div>
        <div class="content">
            <p>A new learner's license application has been submitted and requires your review.</p>
            
            <div class="info-row">
                <span class="label">Submission ID:</span>
                <span class="value">${submissionData.submissionId}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Applicant Name:</span>
                <span class="value">${submissionData.fullName}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${submissionData.email}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${submissionData.phoneNumber}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Date of Birth:</span>
                <span class="value">${formatDate(submissionData.dateOfBirth)}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Submitted At:</span>
                <span class="value">${formatDate(submissionData.submittedAt)}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Address:</span>
                <span class="value">
                    ${submissionData.address.street}, ${submissionData.address.city}, 
                    ${submissionData.address.state} - ${submissionData.address.pincode}
                </span>
            </div>
        </div>
        <div class="footer">
            <p>Please log in to the admin dashboard to review this application.</p>
            <p><strong>Action Required:</strong> Document verification and status update</p>
        </div>
    </body>
    </html>
  `;
};

export const getApplicantConfirmationTemplate = (submissionData: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .success-box { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #28a745; }
            .info-box { background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .footer { margin-top: 20px; padding: 15px; background-color: #e9e9e9; text-align: center; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Application Submitted Successfully!</h1>
        </div>
        <div class="content">
            <div class="success-box">
                <h3>✅ Your learner's license application has been received!</h3>
            </div>
            
            <p>Dear <strong>${submissionData.fullName}</strong>,</p>
            
            <p>Thank you for submitting your learner's license application. We have successfully received your documents and personal information.</p>
            
            <div class="info-box">
                <h4>📋 Application Details:</h4>
                <p><strong>Submission ID:</strong> ${submissionData.submissionId}</p>
                <p><strong>Submitted On:</strong> ${formatDate(submissionData.submittedAt)}</p>
                <p><strong>Status:</strong> Pending Review</p>
            </div>
            
            <div class="info-box">
                <h4>⏳ What's Next?</h4>
                <ul>
                    <li>Our team will review your documents within 2-3 business days</li>
                    <li>You will receive an email notification once the review is complete</li>
                    <li>If approved, further instructions will be provided</li>
                    <li>If any issues are found, we'll contact you with details</li>
                </ul>
            </div>
            
            <p><strong>Important:</strong> Please keep your Submission ID (<code>${submissionData.submissionId}</code>) for future reference.</p>
        </div>
        <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p><em>This is an automated email. Please do not reply to this message.</em></p>
        </div>
    </body>
    </html>
  `;
};

export const getStatusUpdateTemplate = (submissionData: any, status: string, notes?: string): string => {
  const statusConfig = {
    approved: {
      color: '#28a745',
      bgColor: '#d4edda',
      icon: '✅',
      title: 'Application Approved',
      message: 'Congratulations! Your learner\'s license application has been approved.'
    },
    rejected: {
      color: '#dc3545',
      bgColor: '#f8d7da',
      icon: '❌',
      title: 'Application Rejected',
      message: 'Unfortunately, your learner\'s license application has been rejected.'
    },
    pending: {
      color: '#ffc107',
      bgColor: '#fff3cd',
      icon: '⏳',
      title: 'Application Under Review',
      message: 'Your learner\'s license application is currently under review.'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Status Update</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${config.color}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .status-box { background-color: ${config.bgColor}; color: ${config.color}; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid ${config.color}; }
            .info-box { background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .footer { margin-top: 20px; padding: 15px; background-color: #e9e9e9; text-align: center; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${config.icon} ${config.title}</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${submissionData.fullName}</strong>,</p>
            
            <div class="status-box">
                <h3>${config.message}</h3>
            </div>
            
            <div class="info-box">
                <h4>📋 Application Details:</h4>
                <p><strong>Submission ID:</strong> ${submissionData.submissionId}</p>
                <p><strong>Updated Status:</strong> ${status.toUpperCase()}</p>
                <p><strong>Updated On:</strong> ${formatDate(new Date())}</p>
            </div>
            
            ${notes ? `
            <div class="info-box">
                <h4>📝 Additional Notes:</h4>
                <p>${notes}</p>
            </div>
            ` : ''}
            
            ${status === 'approved' ? `
            <div class="info-box">
                <h4>🎉 Next Steps:</h4>
                <ul>
                    <li>You can now proceed to book your driving test</li>
                    <li>Visit your nearest RTO office with required documents</li>
                    <li>Carry a printout of this email as proof of approval</li>
                </ul>
            </div>
            ` : ''}
            
            ${status === 'rejected' ? `
            <div class="info-box">
                <h4>🔄 What You Can Do:</h4>
                <ul>
                    <li>Review the additional notes above for specific issues</li>
                    <li>Correct the mentioned problems</li>
                    <li>Submit a new application with updated documents</li>
                </ul>
            </div>
            ` : ''}
        </div>
        <div class="footer">
            <p>If you have any questions regarding this update, please contact our support team.</p>
            <p><em>This is an automated email. Please do not reply to this message.</em></p>
        </div>
    </body>
    </html>
  `;
};