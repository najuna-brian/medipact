/**
 * Notification Service
 * 
 * Handles sending notifications to users about withdrawal status.
 * 
 * MVP Configuration:
 * - Uses console logging for development/testing
 * - Notifications are logged and can be displayed in-app
 * - Email/SMS integration is stubbed out for future implementation
 * 
 * For production, integrate with:
 * - Email: SendGrid, AWS SES, etc.
 * - SMS: Twilio, AWS SNS, etc.
 * - In-app: Store notifications in database for user dashboard
 */

/**
 * Send withdrawal notification to user
 * 
 * @param {Object} options - Notification options
 * @param {string} options.userType - 'patient' or 'hospital'
 * @param {string} options.userId - UPI or hospital ID
 * @param {string} options.email - User email (optional)
 * @param {string} options.phone - User phone (optional)
 * @param {string} options.status - Withdrawal status
 * @param {Object} options.withdrawal - Withdrawal details
 */
export async function sendWithdrawalNotification(options) {
  const { userType, userId, email, phone, status, withdrawal } = options;

  try {
    const message = buildWithdrawalMessage(status, withdrawal);
    
    // MVP: Log notification (can be displayed in-app via notification system)
    // In production, integrate with email/SMS services
    console.log(`[NOTIFICATION] ${userType.toUpperCase()} ${userId}: ${message.title}`);
    console.log(`[NOTIFICATION] Message: ${message.body}`);
    
    // MVP: Store notification in database for in-app display (future enhancement)
    // For now, notifications are logged and can be shown in admin/user dashboards
    
    // Email/SMS integration stubbed out for MVP
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.) for production
    if (email) {
      await sendEmailNotification(email, message);
    }
    
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.) for production
    if (phone) {
      await sendSMSNotification(phone, message);
    }
    
    return { success: true, sentVia: 'console', message: 'Notification logged (in-app display available)' };
  } catch (error) {
    console.error(`[NOTIFICATION] Failed to send notification to ${userId}:`, error);
    // Don't throw - notifications are non-critical
    return { success: false, error: error.message };
  }
}

/**
 * Build withdrawal notification message
 */
function buildWithdrawalMessage(status, withdrawal) {
  const amountUSD = withdrawal.amountUSD || withdrawal.amount_usd || 0;
  const amountHBAR = withdrawal.amountHBAR || withdrawal.amount_hbar || 0;
  const paymentMethod = withdrawal.paymentMethod || withdrawal.payment_method || 'account';
  
  const messages = {
    pending: {
      title: 'Withdrawal Request Received',
      body: `Your withdrawal request of $${amountUSD.toFixed(2)} (${amountHBAR.toFixed(4)} HBAR) has been received and is being processed. You will be notified once it's completed.`
    },
    processing: {
      title: 'Withdrawal Processing',
      body: `Your withdrawal of $${amountUSD.toFixed(2)} is currently being processed and will be sent to your ${paymentMethod === 'bank' ? 'bank account' : 'mobile money'} shortly.`
    },
    completed: {
      title: 'Withdrawal Completed',
      body: `Your withdrawal of $${amountUSD.toFixed(2)} has been successfully completed and sent to your ${paymentMethod === 'bank' ? 'bank account' : 'mobile money'}. Transaction ID: ${withdrawal.transactionId || withdrawal.transaction_id || 'N/A'}.`
    },
    failed: {
      title: 'Withdrawal Failed',
      body: `Unfortunately, your withdrawal request of $${amountUSD.toFixed(2)} could not be processed. Please check your payment method settings or contact support. The funds remain in your wallet.`
    }
  };
  
  return messages[status] || messages.pending;
}

/**
 * Send email notification (stubbed for MVP)
 * 
 * MVP: Logs email notification (not sent)
 * Production: Integrate with email service (SendGrid, AWS SES, etc.)
 */
async function sendEmailNotification(email, message) {
  // MVP: Email notifications are logged but not sent
  // TODO: Integrate with email service for production
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: email,
  //   from: 'noreply@medipact.com',
  //   subject: message.title,
  //   text: message.body,
  //   html: `<p>${message.body}</p>`
  // });
  
  console.log(`[EMAIL] To: ${email}`);
  console.log(`[EMAIL] Subject: ${message.title}`);
  console.log(`[EMAIL] Body: ${message.body}`);
  console.log(`[EMAIL] Note: Email not sent in MVP mode - use in-app notifications`);
}

/**
 * Send SMS notification (stubbed for MVP)
 * 
 * MVP: Logs SMS notification (not sent)
 * Production: Integrate with SMS service (Twilio, AWS SNS, etc.)
 */
async function sendSMSNotification(phone, message) {
  // MVP: SMS notifications are logged but not sent
  // TODO: Integrate with SMS service for production
  // Example with Twilio:
  // const twilio = require('twilio');
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: `${message.title}: ${message.body}`,
  //   to: phone,
  //   from: process.env.TWILIO_PHONE_NUMBER
  // });
  
  console.log(`[SMS] To: ${phone}`);
  console.log(`[SMS] Message: ${message.title}: ${message.body}`);
  console.log(`[SMS] Note: SMS not sent in MVP mode - use in-app notifications`);
}

/**
 * Send balance threshold notification
 * Notify user when balance reaches withdrawal threshold
 */
export async function sendBalanceThresholdNotification(userType, userId, email, phone, balanceUSD, thresholdUSD) {
  try {
    const message = {
      title: 'Withdrawal Threshold Reached',
      body: `Your wallet balance ($${balanceUSD.toFixed(2)}) has reached your withdrawal threshold ($${thresholdUSD.toFixed(2)}). An automatic withdrawal will be processed shortly.`
    };
    
    console.log(`[NOTIFICATION] ${userType.toUpperCase()} ${userId}: ${message.title}`);
    
    if (email) {
      await sendEmailNotification(email, message);
    }
    
    if (phone) {
      await sendSMSNotification(phone, message);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`[NOTIFICATION] Failed to send threshold notification:`, error);
    return { success: false, error: error.message };
  }
}

