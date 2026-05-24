// backend/src/utils/email.service.js
const nodemailer = require('nodemailer');

// Set up the transporter with the provided credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'crownevecenter@gmail.com',
    pass: process.env.SMTP_PASS || 'znws fvqu yams tabz',
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
      from: `"Crown Eve Center" <crownevecenter@gmail.com>`,
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
 * Send a verification OTP email
 * @param {string} to - Recipient email address
 * @param {string} otp - The 6-digit OTP
 */
const sendOtpEmail = async (to, otp) => {
  const subject = 'Your Verification Code - Crown Eve Center';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #ff4500; text-align: center;">Crown Eve Center</h2>
      <h3 style="color: #333;">Account Verification</h3>
      <p style="color: #555; line-height: 1.5;">Thank you for registering! Please use the following One-Time Password (OTP) to verify your email address:</p>
      
      <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${otp}</span>
      </div>
      
      <p style="color: #d9534f; font-weight: bold; text-align: center;">This code will expire in 10 minutes.</p>
      <p style="color: #555; line-height: 1.5;">If you did not request this code, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">© Crown Eve Center</p>
    </div>
  `;

  return sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendOtpEmail,
};
