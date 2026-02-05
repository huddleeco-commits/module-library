/**
 * Notification Service
 *
 * Handles sending notifications via email and SMS.
 * Logs all notifications to notification_log table.
 *
 * Supports:
 *   - Reservation confirmations
 *   - Reservation cancellations
 *   - Reservation reminders
 *   - Custom notifications with templates
 */

// Notification templates
const TEMPLATES = {
  reservation_confirmation: {
    subject: 'Reservation Confirmed - {{businessName}}',
    email: `
Hello {{customerName}},

Your reservation has been confirmed!

Details:
- Date: {{date}}
- Time: {{time}}
- Party Size: {{partySize}} guests
- Reference: {{referenceCode}}

If you need to make any changes, please contact us or reply to this email.

See you soon!
{{businessName}}
    `.trim(),
    sms: 'Your reservation at {{businessName}} is confirmed for {{date}} at {{time}} ({{partySize}} guests). Ref: {{referenceCode}}'
  },

  reservation_cancellation: {
    subject: 'Reservation Cancelled - {{businessName}}',
    email: `
Hello {{customerName}},

Your reservation has been cancelled.

Original Details:
- Date: {{date}}
- Time: {{time}}
- Reference: {{referenceCode}}

{{#reason}}
Reason: {{reason}}
{{/reason}}

If this was a mistake or you'd like to rebook, please contact us.

{{businessName}}
    `.trim(),
    sms: 'Your reservation at {{businessName}} for {{date}} at {{time}} has been cancelled. Ref: {{referenceCode}}'
  },

  reservation_reminder: {
    subject: 'Reminder: Your Reservation Tomorrow - {{businessName}}',
    email: `
Hello {{customerName}},

This is a friendly reminder about your upcoming reservation:

- Date: {{date}}
- Time: {{time}}
- Party Size: {{partySize}} guests
- Reference: {{referenceCode}}

We look forward to seeing you!

If you need to cancel or modify your reservation, please let us know as soon as possible.

{{businessName}}
    `.trim(),
    sms: 'Reminder: Your reservation at {{businessName}} is tomorrow at {{time}} for {{partySize}} guests. See you then!'
  },

  custom: {
    subject: '{{subject}}',
    email: '{{body}}',
    sms: '{{body}}'
  }
};

// Simple template rendering (Mustache-like)
function renderTemplate(template, data) {
  let result = template;

  // Simple {{variable}} replacement
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });

  // Conditional sections {{#key}}...{{/key}}
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
    return data[key] ? content : '';
  });

  return result.trim();
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Format time for display
function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Create notification service
function createNotificationService(options = {}) {
  const {
    businessName = 'Our Restaurant',
    emailProvider = null,   // { send: async (to, subject, body) => {} }
    smsProvider = null,     // { send: async (to, body) => {} }
    logStore = null,        // Optional: store for logging
    defaultChannels = ['email']
  } = options;

  // In-memory log for demo
  const notificationLog = logStore || [];

  // Log notification
  function logNotification(template, recipient, channels, status, relatedType, relatedId, error = null) {
    const entry = {
      id: notificationLog.length + 1,
      template,
      recipient_email: recipient.email,
      recipient_phone: recipient.phone,
      channels,
      status,
      related_type: relatedType,
      related_id: relatedId,
      error_message: error,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    };
    notificationLog.push(entry);
    return entry;
  }

  return {
    /**
     * Send reservation confirmation
     */
    async sendReservationConfirmation(reservation) {
      const templateData = {
        businessName,
        customerName: reservation.customer_name,
        date: formatDate(reservation.date),
        time: formatTime(reservation.time),
        partySize: reservation.party_size,
        referenceCode: reservation.reference_code
      };

      const template = TEMPLATES.reservation_confirmation;
      const channels = [];
      const errors = [];

      // Send email
      if (reservation.customer_email && (emailProvider || defaultChannels.includes('email'))) {
        channels.push('email');
        try {
          const subject = renderTemplate(template.subject, templateData);
          const body = renderTemplate(template.email, templateData);

          if (emailProvider) {
            await emailProvider.send(reservation.customer_email, subject, body);
          } else {
            // Demo mode - just log
            console.log(`[NOTIFICATION] Email to ${reservation.customer_email}:\n  Subject: ${subject}\n  Body: ${body.substring(0, 100)}...`);
          }
        } catch (e) {
          errors.push(`Email: ${e.message}`);
        }
      }

      // Send SMS
      if (reservation.customer_phone && smsProvider) {
        channels.push('sms');
        try {
          const body = renderTemplate(template.sms, templateData);
          await smsProvider.send(reservation.customer_phone, body);
        } catch (e) {
          errors.push(`SMS: ${e.message}`);
        }
      }

      const status = errors.length === 0 ? 'sent' : (errors.length < channels.length ? 'partial' : 'failed');
      logNotification('reservation_confirmation', {
        email: reservation.customer_email,
        phone: reservation.customer_phone
      }, channels, status, 'reservation', reservation.id, errors.join('; ') || null);

      return { success: errors.length === 0, channels, errors };
    },

    /**
     * Send reservation cancellation
     */
    async sendReservationCancellation(reservation, reason = null) {
      const templateData = {
        businessName,
        customerName: reservation.customer_name,
        date: formatDate(reservation.date),
        time: formatTime(reservation.time),
        referenceCode: reservation.reference_code,
        reason
      };

      const template = TEMPLATES.reservation_cancellation;
      const channels = [];
      const errors = [];

      if (reservation.customer_email && (emailProvider || defaultChannels.includes('email'))) {
        channels.push('email');
        try {
          const subject = renderTemplate(template.subject, templateData);
          const body = renderTemplate(template.email, templateData);

          if (emailProvider) {
            await emailProvider.send(reservation.customer_email, subject, body);
          } else {
            console.log(`[NOTIFICATION] Email to ${reservation.customer_email}:\n  Subject: ${subject}\n  Body: ${body.substring(0, 100)}...`);
          }
        } catch (e) {
          errors.push(`Email: ${e.message}`);
        }
      }

      if (reservation.customer_phone && smsProvider) {
        channels.push('sms');
        try {
          const body = renderTemplate(template.sms, templateData);
          await smsProvider.send(reservation.customer_phone, body);
        } catch (e) {
          errors.push(`SMS: ${e.message}`);
        }
      }

      const status = errors.length === 0 ? 'sent' : (errors.length < channels.length ? 'partial' : 'failed');
      logNotification('reservation_cancellation', {
        email: reservation.customer_email,
        phone: reservation.customer_phone
      }, channels, status, 'reservation', reservation.id, errors.join('; ') || null);

      return { success: errors.length === 0, channels, errors };
    },

    /**
     * Send reservation reminder
     */
    async sendReservationReminder(reservation) {
      const templateData = {
        businessName,
        customerName: reservation.customer_name,
        date: formatDate(reservation.date),
        time: formatTime(reservation.time),
        partySize: reservation.party_size,
        referenceCode: reservation.reference_code
      };

      const template = TEMPLATES.reservation_reminder;
      const channels = [];
      const errors = [];

      if (reservation.customer_email && (emailProvider || defaultChannels.includes('email'))) {
        channels.push('email');
        try {
          const subject = renderTemplate(template.subject, templateData);
          const body = renderTemplate(template.email, templateData);

          if (emailProvider) {
            await emailProvider.send(reservation.customer_email, subject, body);
          } else {
            console.log(`[NOTIFICATION] Email to ${reservation.customer_email}:\n  Subject: ${subject}\n  Body: ${body.substring(0, 100)}...`);
          }
        } catch (e) {
          errors.push(`Email: ${e.message}`);
        }
      }

      if (reservation.customer_phone && smsProvider) {
        channels.push('sms');
        try {
          const body = renderTemplate(template.sms, templateData);
          await smsProvider.send(reservation.customer_phone, body);
        } catch (e) {
          errors.push(`SMS: ${e.message}`);
        }
      }

      const status = errors.length === 0 ? 'sent' : (errors.length < channels.length ? 'partial' : 'failed');
      logNotification('reservation_reminder', {
        email: reservation.customer_email,
        phone: reservation.customer_phone
      }, channels, status, 'reservation', reservation.id, errors.join('; ') || null);

      return { success: errors.length === 0, channels, errors };
    },

    /**
     * Send custom notification
     */
    async sendCustom(recipient, subject, body, options = {}) {
      const { relatedType, relatedId, channels: requestedChannels } = options;
      const channels = requestedChannels || defaultChannels;
      const errors = [];

      if (recipient.email && channels.includes('email')) {
        try {
          if (emailProvider) {
            await emailProvider.send(recipient.email, subject, body);
          } else {
            console.log(`[NOTIFICATION] Custom email to ${recipient.email}:\n  Subject: ${subject}`);
          }
        } catch (e) {
          errors.push(`Email: ${e.message}`);
        }
      }

      if (recipient.phone && channels.includes('sms') && smsProvider) {
        try {
          await smsProvider.send(recipient.phone, body);
        } catch (e) {
          errors.push(`SMS: ${e.message}`);
        }
      }

      const status = errors.length === 0 ? 'sent' : 'failed';
      logNotification('custom', recipient, channels, status, relatedType, relatedId, errors.join('; ') || null);

      return { success: errors.length === 0, channels, errors };
    },

    /**
     * Get notification log
     */
    getLog(filters = {}) {
      let results = [...notificationLog];

      if (filters.relatedType) {
        results = results.filter(n => n.related_type === filters.relatedType);
      }
      if (filters.relatedId) {
        results = results.filter(n => n.related_id === filters.relatedId);
      }
      if (filters.status) {
        results = results.filter(n => n.status === filters.status);
      }
      if (filters.limit) {
        results = results.slice(-filters.limit);
      }

      return results;
    },

    /**
     * Get available templates
     */
    getTemplates() {
      return Object.keys(TEMPLATES);
    }
  };
}

module.exports = { createNotificationService, renderTemplate, TEMPLATES };
