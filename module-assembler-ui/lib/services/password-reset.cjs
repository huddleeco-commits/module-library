/**
 * Password Reset Service - SlabTrack Pattern
 * Email service for password reset functionality
 *
 * Features:
 * - Resend API integration
 * - HTML email templates
 * - Configurable app name and colors
 * - Error handling with fallback
 */

let Resend = null;
let resend = null;

// Lazy load Resend to avoid errors if not installed
try {
  Resend = require('resend').Resend;
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {
  console.log('[PasswordReset] Resend SDK not available');
}

// ===========================================
// CONFIGURATION
// ===========================================
const APP_NAME = process.env.APP_NAME || 'Blink';
const APP_URL = process.env.APP_URL || 'https://blink.local';
const FROM_EMAIL = process.env.FROM_EMAIL || `${APP_NAME} <noreply@${APP_URL.replace('https://', '')}>`;
const THEME_COLOR = process.env.THEME_COLOR || '#667eea';
const THEME_COLOR_SECONDARY = process.env.THEME_COLOR_SECONDARY || '#764ba2';

/**
 * Generate password reset email HTML
 * @param {string} resetUrl - Full reset URL with token
 * @returns {string} HTML email content
 */
function generateResetEmailHtml(resetUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f7fafc; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${THEME_COLOR} 0%, ${THEME_COLOR_SECONDARY} 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, ${THEME_COLOR} 0%, ${THEME_COLOR_SECONDARY} 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .button:hover { opacity: 0.9; }
        .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 14px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .link-box { background: #edf2f7; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi there!</h2>
          <p>We received a request to reset your ${APP_NAME} password. Click the button below to create a new password:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p class="link-box">${resetUrl}</p>

          <div class="warning">
            <strong>This link expires in 1 hour</strong><br>
            If you didn't request this password reset, you can safely ignore this email.
          </div>

          <p>Thanks,<br>The ${APP_NAME} Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text version of reset email
 * @param {string} resetUrl - Full reset URL with token
 * @returns {string} Plain text email content
 */
function generateResetEmailText(resetUrl) {
  return `
Password Reset Request

Hi there!

We received a request to reset your ${APP_NAME} password.

Click this link to reset your password:
${resetUrl}

This link expires in 1 hour.

If you didn't request this password reset, you can safely ignore this email.

Thanks,
The ${APP_NAME} Team
  `.trim();
}

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${APP_URL}/reset-password/${resetToken}`;

  // Check if Resend is available
  if (!resend) {
    console.log('[PasswordReset] Email service not configured, reset URL:', resetUrl);
    return {
      success: false,
      error: 'Email service not configured',
      resetUrl // Return for development/testing
    };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Reset Your ${APP_NAME} Password`,
      html: generateResetEmailHtml(resetUrl),
      text: generateResetEmailText(resetUrl)
    });

    console.log('[PasswordReset] Reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('[PasswordReset] Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendWelcomeEmail(email, name) {
  if (!resend) {
    console.log('[PasswordReset] Email service not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to ${APP_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${THEME_COLOR} 0%, ${THEME_COLOR_SECONDARY} 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, ${THEME_COLOR} 0%, ${THEME_COLOR_SECONDARY} 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${APP_NAME}!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name || 'there'}!</h2>
              <p>Thanks for joining ${APP_NAME}. We're excited to have you on board!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}" class="button">Get Started</a>
              </div>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best,<br>The ${APP_NAME} Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('[PasswordReset] Welcome email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('[PasswordReset] Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if email service is available
 * @returns {boolean}
 */
function isEmailServiceAvailable() {
  return resend !== null;
}

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  isEmailServiceAvailable,
  generateResetEmailHtml,
  generateResetEmailText
};
