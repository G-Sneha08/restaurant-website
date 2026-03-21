const nodemailer = require("nodemailer");

/**
 * =============================================================================
 * GMAIL SMTP INFRASTRUCTURE - ADVANCED PRODUCTION SETUP
 * =============================================================================
 */
const EMAIL_USER = (process.env.EMAIL_USER || "sneha901932@gmail.com").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "lqfmxrkvrcakdprs").trim();

// Configuration using Pool for better persistence in cloud environments
const transportOptions = {
    service: "gmail", // Handles port negotiation internally (465/587)
    pool: true,      // Keeps the connection open to avoid repeated handshake timeouts
    maxConnections: 5,
    maxMessages: 100,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    tls: {
       rejectUnauthorized: false // Prevents SSL verification errors common on Vercel/Render
    },
    connectionTimeout: 20000, // Aggregate timeout (20s)
    greetingTimeout: 10000,
    socketTimeout: 30000,
    debug: true,
    logger: true // Force detailed traffic logs to Render console
};

const transporter = nodemailer.createTransport(transportOptions);

// Verification Diagnostic Output
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ [SMTP_CRITICAL] Authentication/Network Timeout for: " + EMAIL_USER);
        console.error("❌ [SMTP_DETAIL] Render Free Tier identifies as blocked. Error: " + error.message);
    } else {
        console.log("✅ [SMTP_READY] Gmail Connection Secured (Pooleed Mode): " + EMAIL_USER);
    }
});

/**
 * Robust Wrapper to dispatch emails with tracking
 */
const sendMailHelper = async (options) => {
    try {
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.error("❌ [MAIL_FAILURE] Missing Credentials.");
            return null;
        }

        console.log(`📡 [MAIL_QUEUE] Attempting delivery to: ${options.to}`);
        
        const mailOptions = {
            from: `"Lumina Dine" <${EMAIL_USER}>`,
            bcc: EMAIL_USER, // Copy admin for confirmation
            ...options
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [MAIL_SUCCESS] Delivered! ID: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`❌ [MAIL_FAILURE] Transmission error: ${err.message}`);
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
        html: `<h2>Hello ${name}!</h2><p>Your exquisite journey with us has begun.</p>`
    });
};

const sendBookingEmail = async (email, name, date, time, guests) => {
    if (!email) return;
    return await sendMailHelper({
        to: email,
        subject: "Reservation Confirmed 📅",
        html: `<h2>Table Confirmed</h2><p>${date} at ${time} for ${guests} guests.</p>`
    });
};

const sendOrderEmail = async (email, name, orderId, totalPrice) => {
    if (!email) return;
    return await sendMailHelper({
        to: email,
        subject: "Order Received: #${orderId} 🍔",
        html: `<h2>Order Success</h2><p>Order #${orderId} - Total: ₹${totalPrice}</p>`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendBookingEmail,
    sendOrderEmail
};