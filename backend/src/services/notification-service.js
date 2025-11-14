/**
 * Notification Service
 * 
 * Handles sending notifications (email, SMS) to users about withdrawal status.
 * Currently uses console logging, but can be extended with email/SMS providers.
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
    
    // Log notification (in production, send via email/SMS)
    console.log(`[NOTIFICATION] ${userType.toUpperCase()} ${userId}: ${message.title}`);
    console.log(`[NOTIFICATION] Message: ${message.body}`);
    
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    if (email) {
      await sendEmailNotification(email, message);
    }
    
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    if (phone) {
      await sendSMSNotification(phone, message);
    }
    
    return { success: true, sentVia: email ? 'email' : phone ? 'sms' : 'console' };
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
 * Send email notification (placeholder for email service integration)
 */
async function sendEmailNotification(email, message) {
  // TODO: Integrate with email service
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
}

/**
 * Send SMS notification (placeholder for SMS service integration)
 */
async function sendSMSNotification(phone, message) {
  // TODO: Integrate with SMS service
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

