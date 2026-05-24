// backend/src/utils/email.service.js
const nodemailer = require('nodemailer');

// Set up the transporter
// For Gmail, you will need to use an "App Password" if 2FA is enabled.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // e.g., 'crownevecenter@gmail.com'
    pass: process.env.SMTP_PASS, // The 16-character App Password
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body of the email
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Crown Eve Center" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send a verification email
 * @param {string} to - Recipient email address
 * @param {string} token - The verification token
 */
const sendVerificationEmail = async (to, token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  const subject = 'Verify your Crown Eve Center Account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #ff4500; text-align: center;">Crown Eve Center</h2>
      <h3 style="color: #333;">Welcome to Crown Eve Center!</h3>
      <p style="color: #555; line-height: 1.5;">Thank you for registering. Please confirm your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #ff4500; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #555; line-height: 1.5;">If the button above does not work, you can copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #0066cc;">${verificationLink}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">If you did not create this account, please ignore this email.</p>
    </div>
  `;

  return sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
};
