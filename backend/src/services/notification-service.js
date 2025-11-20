/**
 * Notification Service
 * 
 * Handles email and SMS notifications for patients.
 * Gracefully falls back to console logging when services are not configured.
 */

/**
 * Send email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlBody - HTML email body
 * @param {string} textBody - Plain text email body (optional)
 * @returns {Promise<{success: boolean, method: string, error?: string}>}
 */
export async function sendEmail(to, subject, htmlBody, textBody = null) {
  // Check if email service is configured
  const emailService = process.env.EMAIL_SERVICE; // 'sendgrid', 'ses', 'smtp', etc.
  const emailApiKey = process.env.EMAIL_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'noreply@medipact.com';
  
  if (!emailService || !emailApiKey) {
    // Fallback: Log to console for hackathon/demo purposes
    console.log('\n=== EMAIL NOTIFICATION (FALLBACK MODE) ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${textBody || htmlBody}`);
    console.log('==========================================\n');
    
    return {
      success: true,
      method: 'console_fallback',
      message: 'Email logged to console (email service not configured)'
    };
  }
  
  try {
    switch (emailService.toLowerCase()) {
      case 'sendgrid':
        return await sendViaSendGrid(to, subject, htmlBody, textBody, emailFrom, emailApiKey);
      case 'ses':
        return await sendViaSES(to, subject, htmlBody, textBody, emailFrom);
      case 'smtp':
        return await sendViaSMTP(to, subject, htmlBody, textBody, emailFrom);
      default:
        console.warn(`Unknown email service: ${emailService}, using fallback`);
        return {
          success: true,
          method: 'console_fallback',
          message: 'Email logged to console (unknown email service)'
        };
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    // Fallback to console
    console.log('\n=== EMAIL NOTIFICATION (FALLBACK - ERROR) ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${textBody || htmlBody}`);
    console.log('==========================================\n');
    
    return {
      success: true,
      method: 'console_fallback',
      error: error.message,
      message: 'Email logged to console (sending failed)'
    };
  }
}

/**
 * Send SMS notification
 * @param {string} to - Recipient phone number (E.164 format)
 * @param {string} message - SMS message
 * @returns {Promise<{success: boolean, method: string, error?: string}>}
 */
export async function sendSMS(to, message) {
  // Check if SMS service is configured
  const smsService = process.env.SMS_SERVICE; // 'twilio', 'aws-sns', etc.
  const smsApiKey = process.env.SMS_API_KEY;
  const smsFrom = process.env.SMS_FROM;
  
  if (!smsService || !smsApiKey) {
    // Fallback: Log to console for hackathon/demo purposes
    console.log('\n=== SMS NOTIFICATION (FALLBACK MODE) ===');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('==========================================\n');
    
    return {
      success: true,
      method: 'console_fallback',
      message: 'SMS logged to console (SMS service not configured)'
    };
  }
  
  try {
    switch (smsService.toLowerCase()) {
      case 'twilio':
        return await sendViaTwilio(to, message, smsFrom, smsApiKey);
      case 'aws-sns':
        return await sendViaSNS(to, message);
      default:
        console.warn(`Unknown SMS service: ${smsService}, using fallback`);
        return {
          success: true,
          method: 'console_fallback',
          message: 'SMS logged to console (unknown SMS service)'
        };
    }
  } catch (error) {
    console.error('SMS sending failed:', error);
    // Fallback to console
    console.log('\n=== SMS NOTIFICATION (FALLBACK - ERROR) ===');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('==========================================\n');
    
    return {
      success: true,
      method: 'console_fallback',
      error: error.message,
      message: 'SMS logged to console (sending failed)'
    };
  }
}

/**
 * Send patient UPI notification
 * @param {Object} patientInfo - Patient information
 * @param {string} patientInfo.upi - Patient UPI
 * @param {string} patientInfo.email - Patient email (optional)
 * @param {string} patientInfo.phone - Patient phone (optional)
 * @param {string} patientInfo.name - Patient name
 * @param {string} hospitalName - Hospital name
 * @returns {Promise<{email?: Object, sms?: Object}>}
 */
export async function sendUPINotification(patientInfo, hospitalName = 'MediPact') {
  const { upi, email, phone, name } = patientInfo;
  const results = {};
  
  const portalUrl = process.env.PATIENT_PORTAL_URL || 'https://medipact.com/patient/login';
  const subject = 'Your MediPact Patient Account Access';
  
  const emailBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to MediPact, ${name || 'Patient'}!</h2>
          <p>Your medical data has been uploaded to MediPact, and your patient account has been created.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Your Patient Identifier (UPI):</p>
            <p style="font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb; margin: 0;">${upi}</p>
          </div>
          
          <p><strong>How to access your account:</strong></p>
          <ol>
            <li>Visit: <a href="${portalUrl}">${portalUrl}</a></li>
            <li>Enter your UPI: <code>${upi}</code></li>
            <li>View your medical records and earnings</li>
          </ol>
          
          <p><strong>Alternative login:</strong> If you forget your UPI, you can retrieve it using your email or phone number on the login page.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
            This account was created by ${hospitalName}. If you have questions, please contact your healthcare provider.
          </p>
        </div>
      </body>
    </html>
  `;
  
  const textBody = `
Welcome to MediPact, ${name || 'Patient'}!

Your medical data has been uploaded to MediPact, and your patient account has been created.

Your Patient Identifier (UPI): ${upi}

How to access your account:
1. Visit: ${portalUrl}
2. Enter your UPI: ${upi}
3. View your medical records and earnings

Alternative login: If you forget your UPI, you can retrieve it using your email or phone number on the login page.

This account was created by ${hospitalName}. If you have questions, please contact your healthcare provider.
  `;
  
  const smsMessage = `MediPact: Your UPI is ${upi}. Access your account at ${portalUrl}`;
  
  // Send email if available
  if (email) {
    results.email = await sendEmail(email, subject, emailBody, textBody);
  }
  
  // Send SMS if available
  if (phone) {
    results.sms = await sendSMS(phone, smsMessage);
  }
  
  return results;
}

/**
 * Send withdrawal notification
 * @param {Object} params - Notification parameters
 * @param {string} params.userType - 'patient' or 'hospital'
 * @param {string} params.userId - User identifier (UPI or hospitalId)
 * @param {string} params.email - User email
 * @param {string|null} params.phone - User phone (optional)
 * @param {string} params.status - 'processing' or 'completed'
 * @param {Object} params.withdrawal - Withdrawal details
 * @returns {Promise<{email?: Object, sms?: Object}>}
 */
export async function sendWithdrawalNotification(params) {
  const { userType, userId, email, phone, status, withdrawal } = params;
  const results = {};
  
  const userName = userType === 'patient' ? 'Patient' : 'Hospital';
  const subject = status === 'completed' 
    ? `Your ${userName} Withdrawal Has Been Completed`
    : `Your ${userName} Withdrawal Is Being Processed`;
  
  const statusText = status === 'completed' ? 'completed' : 'is being processed';
  const amountText = `$${withdrawal.amountUSD.toFixed(2)}`;
  
  const emailBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Withdrawal ${status === 'completed' ? 'Completed' : 'Processing'}</h2>
          <p>Your withdrawal request has been ${statusText}.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Withdrawal Details:</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ${amountText}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${withdrawal.paymentMethod}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${status}</p>
            ${withdrawal.transactionId ? `<p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${withdrawal.transactionId}</p>` : ''}
          </div>
          
          ${status === 'completed' 
            ? '<p>Your funds have been successfully transferred to your account.</p>'
            : '<p>Your withdrawal is being processed and will be completed shortly. You will receive another notification when it is completed.</p>'
          }
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
            If you have any questions, please contact support.
          </p>
        </div>
      </body>
    </html>
  `;
  
  const textBody = `
Withdrawal ${status === 'completed' ? 'Completed' : 'Processing'}

Your withdrawal request has been ${statusText}.

Withdrawal Details:
Amount: ${amountText}
Payment Method: ${withdrawal.paymentMethod}
Status: ${status}
${withdrawal.transactionId ? `Transaction ID: ${withdrawal.transactionId}` : ''}

${status === 'completed' 
  ? 'Your funds have been successfully transferred to your account.'
  : 'Your withdrawal is being processed and will be completed shortly. You will receive another notification when it is completed.'
}

If you have any questions, please contact support.
  `;
  
  const smsMessage = status === 'completed'
    ? `MediPact: Your withdrawal of ${amountText} has been completed. Transaction ID: ${withdrawal.transactionId || 'N/A'}`
    : `MediPact: Your withdrawal of ${amountText} is being processed. You'll be notified when it's completed.`;
  
  // Send email if available
  if (email) {
    results.email = await sendEmail(email, subject, emailBody, textBody);
  }
  
  // Send SMS if available
  if (phone) {
    results.sms = await sendSMS(phone, smsMessage);
  }
  
  return results;
}

/**
 * Send balance threshold notification
 * @param {string} userType - 'patient' or 'hospital'
 * @param {string} userId - User identifier (UPI or hospitalId)
 * @param {string} email - User email
 * @param {string|null} phone - User phone (optional)
 * @param {number} balanceUSD - Current balance in USD
 * @param {number} thresholdUSD - Withdrawal threshold in USD
 * @returns {Promise<{email?: Object, sms?: Object}>}
 */
export async function sendBalanceThresholdNotification(userType, userId, email, phone, balanceUSD, thresholdUSD) {
  const results = {};
  
  const userName = userType === 'patient' ? 'Patient' : 'Hospital';
  const subject = `Your ${userName} Balance Has Reached the Withdrawal Threshold`;
  
  const emailBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Balance Threshold Reached</h2>
          <p>Your account balance has reached the automatic withdrawal threshold.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Account Details:</p>
            <p style="margin: 5px 0;"><strong>Current Balance:</strong> $${balanceUSD.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Withdrawal Threshold:</strong> $${thresholdUSD.toFixed(2)}</p>
          </div>
          
          <p>An automatic withdrawal has been initiated for your account. You will receive a notification once the withdrawal is processed.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
            If you have any questions, please contact support.
          </p>
        </div>
      </body>
    </html>
  `;
  
  const textBody = `
Balance Threshold Reached

Your account balance has reached the automatic withdrawal threshold.

Account Details:
Current Balance: $${balanceUSD.toFixed(2)}
Withdrawal Threshold: $${thresholdUSD.toFixed(2)}

An automatic withdrawal has been initiated for your account. You will receive a notification once the withdrawal is processed.

If you have any questions, please contact support.
  `;
  
  const smsMessage = `MediPact: Your balance ($${balanceUSD.toFixed(2)}) has reached the withdrawal threshold. An automatic withdrawal has been initiated.`;
  
  // Send email if available
  if (email) {
    results.email = await sendEmail(email, subject, emailBody, textBody);
  }
  
  // Send SMS if available
  if (phone) {
    results.sms = await sendSMS(phone, smsMessage);
  }
  
  return results;
}

// Email service implementations

async function sendViaSendGrid(to, subject, htmlBody, textBody, from, apiKey) {
  const sgMail = await import('@sendgrid/mail');
  sgMail.default.setApiKey(apiKey);
  
  const msg = {
    to,
    from,
    subject,
    text: textBody || htmlBody.replace(/<[^>]*>/g, ''),
    html: htmlBody,
  };
  
  await sgMail.default.send(msg);
  
  return {
    success: true,
    method: 'sendgrid',
    message: 'Email sent via SendGrid'
  };
}

async function sendViaSES(to, subject, htmlBody, textBody, from) {
  // AWS SES implementation would go here
  // For now, fallback
  throw new Error('AWS SES not yet implemented');
}

async function sendViaSMTP(to, subject, htmlBody, textBody, from) {
  // SMTP implementation would go here
  // For now, fallback
  throw new Error('SMTP not yet implemented');
}

// SMS service implementations

async function sendViaTwilio(to, message, from, apiKey) {
  // Twilio implementation would go here
  // For now, fallback
  throw new Error('Twilio not yet implemented');
}

async function sendViaSNS(to, message) {
  // AWS SNS implementation would go here
  // For now, fallback
  throw new Error('AWS SNS not yet implemented');
}
