const nodemailer = require("nodemailer");

/**
 * =============================================================================
 * EMAIL SYSTEM - PRODUCTION INFRASTRUCTURE UPDATE
 * =============================================================================
 */
const EMAIL_USER = (process.env.EMAIL_USER || "sneha901932@gmail.com").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "harzjwlgjsbazgrh").trim();

/**
 * 🛰️ NETWORK COMPATIBILITY NOTE:
 * Render Free tier is known to block outbound SMTP (465/587).
 * If this fails, consider upgrading Render or using an API-based provider 
 * like SendGrid, Brevo, or Mailgun (which work via HTTP Port 443).
 */
const transportConfig = {
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    // Adding keep-alive and timeouts for cloud environments
    connectionTimeout: 10000, 
    greetingTimeout: 5000,
    socketTimeout: 15000,
    debug: true, // Output SMTP traffic to console logs for Render debugging
    logger: true,
    tls: {
       rejectUnauthorized: false
    }
};

const transporter = nodemailer.createTransport(transportConfig);

// Critical Verification with Diagnostic Logs
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ [SMTP_CRITICAL] Authentication/Network failure for: " + EMAIL_USER);
        console.error("❌ [SMTP_DETAIL] Error: " + error.message);
        console.log("   [SMTP_TROUBLESHOOT] 1. Check if Render Free blocks outbound SMTP ports.");
        console.log("   [SMTP_TROUBLESHOOT] 2. Set EMAIL_USER/PASS in Render 'Environment' tab.");
    } else {
        console.log("✅ [SMTP_READY] Status: CONNECTED. Credentials verified for: " + EMAIL_USER);
    }
});

/**
 * Robust Wrapper to dispatch emails with tracking
 */
const sendMailHelper = async (options) => {
    try {
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.error("❌ [MAIL_FAILURE] Distribution aborted: Credentials missing in Environment.");
            return null;
        }

        console.log(`📡 [MAIL_QUEUE] Attempting delivery: "${options.subject}" to: ${options.to}`);
        
        const mailOptions = {
            from: `"Lumina Dine" <${EMAIL_USER}>`,
            bcc: EMAIL_USER, // Copy admin automatically
            ...options
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [MAIL_SUCCESS] Delivered! ID: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`❌ [MAIL_FAILURE] Connection error to ${options.to}: ${err.message}`);
        return null;
    }
};

/**
 * EMAIL TEMPLATES
 */
const sendWelcomeEmail = async (email, name) => {
    if (!email) return;
    return await sendMailHelper({
        to: email,
        subject: "Welcome to Lumina Dine 🍽️",
        html: `<div style="padding:20px;border:1px solid #ddd;border-radius:10px;font-family:sans-serif;">
                <h2 style="color:#d4af37;">Hello ${name}!</h2>
                <p>Welcome to our culinary family. Your account has been registered successfully.</p>
                <p>Enjoy our menu and secure your table whenever you wish.</p>
               </div>`
    });
};

const sendBookingEmail = async (email, name, date, time, guests) => {
    if (!email) return;
    return await sendMailHelper({
        to: email,
        subject: "Reservation Confirmed: Your Table at Lumina 📅",
        html: `<div style="padding:20px;border:1px solid #ddd;border-radius:10px;font-family:sans-serif;">
                <h2 style="color:#2ecc71;">Reservation Secured</h2>
                <p>Greetings ${name || 'Valued Guest'},</p>
                <p>Your table is confirmed for ${date} at ${time} for ${guests} guests.</p>
               </div>`
    });
};

const sendOrderEmail = async (email, name, orderId, totalPrice) => {
    if (!email) return;
    return await sendMailHelper({
        to: email,
        subject: "Order Received: Flavor #${orderId} 🍔",
        html: `<div style="padding:20px;border:1px solid #ddd;border-radius:10px;font-family:sans-serif;">
                <h2 style="color:#3498db;">Indulgence Confirmed</h2>
                <p>Hello ${name}, your order #${orderId} totalling ₹${totalPrice} is being prepared.</p>
               </div>`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendBookingEmail,
    sendOrderEmail
};