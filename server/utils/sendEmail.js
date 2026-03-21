const nodemailer = require("nodemailer");

/**
 * ==========================================
 * EMAIL CONFIGURATION (PRODUCTION READY)
 * ==========================================
 */
const EMAIL_USER = (process.env.EMAIL_USER || "sneha901932@gmail.com").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "harzjwlgjsbazgrh").trim();

// Try Port 587 (STARTTLS) which is often more compatible with cloud firewalls than 465
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    tls: {
       rejectUnauthorized: false,
       minVersion: 'TLSv1.2'
    }
});

// SMTP Verification
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ [SMTP_CRITICAL] Authentication failed for: " + EMAIL_USER);
        console.error("❌ [SMTP_DETAIL] Error: " + error.message);
        console.warn("   [SMTP_HINT] If using Port 587, ensure App Passwords are valid.");
    } else {
        console.log("✅ [SMTP_READY] Gmail Outbound connection verified (Port 587): " + EMAIL_USER);
    }
});

/**
 * Robust Wrapper to dispatch emails with tracking
 */
const sendMailHelper = async (options) => {
    try {
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.error("❌ [MAIL_FAILURE] Distribution aborted: Credentials missing.");
            return null;
        }

        console.log(`📡 [MAIL_QUEUE] Attempting delivery: "${options.subject}" to: ${options.to}`);
        
        const mailOptions = {
            from: `"Lumina Dine" <${EMAIL_USER}>`,
            bcc: EMAIL_USER, // Automatically send a copy to the admin for record keeping
            ...options
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [MAIL_SUCCESS] Delivered! Message-ID: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`❌ [MAIL_FAILURE] Transmission to ${options.to} aborted. Error: ${err.message}`);
        return null;
    }
};

/**
 * USER REGISTRATION - WELCOME EMAIL
 */
const sendWelcomeEmail = async (email, name) => {
    if (!email) return;
    return await sendMailHelper({
        to: email,
        subject: "Your Culinary Journey Begins: Welcome to Lumina Dine 🍽️",
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; border-radius: 12px; border: 1px solid #ddd; max-width: 600px; margin: auto; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 25px;">
                <h1 style="color: #d4af37; margin: 0; letter-spacing: 2px;">LUMINA DINE</h1>
                <p style="text-transform: uppercase; font-size: 11px; color: #777;">Setting the Gold Standard in Excellence</p>
            </div>
            <h2 style="color: #333;">Welcome to the Family, ${name}!</h2>
            <p>We are thrilled to have you join our community. Your account with <b>Lumina Dine</b> is ready.</p>
            <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
                <ul style="padding-left: 20px; color: #555; line-height: 1.8;">
                    <li>✨ Book premium tables.</li>
                    <li>✨ Order gourmet specials.</li>
                    <li>✨ Track your culinary history.</li>
                </ul>
            </div>
            <p style="text-align: center; color: #d4af37; font-weight: bold;">We look forward to serving you.</p>
        </div>
        `
    });
};

/**
 * RESERVATION - CONFIRMATION EMAIL
 */
const sendBookingEmail = async (email, name, date, time, guests) => {
    if (!email) return;
    return await sendMailHelper({
        to: email,
        subject: `Reservation Confirmed - ${date} 📅`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; border-radius: 12px; border: 1px solid #ddd; max-width: 600px; margin: auto; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #d4af37; margin: 0;">LUMINA DINE</h1>
            </div>
            <h2 style="color: #2ecc71; text-align: center;">Reservation Secured</h2>
            <p>Greetings ${name || 'Valued Guest'},</p>
            <div style="background: #fdfdfd; padding: 25px; border-radius: 10px; border: 1px solid #f1f1f1; margin: 25px 0;">
                <table style="width: 100%;">
                    <tr><td style="color: #666;">Date</td><td style="font-weight: bold; text-align: right;">${date}</td></tr>
                    <tr><td style="color: #666;">Time</td><td style="font-weight: bold; text-align: right;">${time}</td></tr>
                    <tr><td style="color: #666;">Guests</td><td style="font-weight: bold; text-align: right;">${guests}</td></tr>
                </table>
            </div>
        </div>
        `
    });
};

/**
 * CHECKOUT/ORDER - CONFIRMATION EMAIL
 */
const sendOrderEmail = async (email, name, orderId, totalPrice) => {
    if (!email) return;
    return await sendMailHelper({
        to: email,
        subject: `Order Success: #${orderId} Received! 🍔`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; border-radius: 12px; border: 1px solid #ddd; max-width: 600px; margin: auto; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #d4af37; margin: 0;">LUMINA DINE</h1>
            </div>
            <h2 style="color: #3498db; text-align: center;">Order Confirmed</h2>
            <p>Hello ${name}, your order was received with gratitude.</p>
            <div style="background: #fdfdfd; padding: 25px; border-radius: 10px; border: 1px solid #f1f1f1; margin: 25px 0;">
                <table style="width: 100%;">
                    <tr><td style="color: #666;">Order ID</td><td style="font-weight: bold; text-align: right;">#${orderId}</td></tr>
                    <tr><td style="color: #666;">Total</td><td style="font-weight: bold; text-align: right; color: #3498db;">₹${totalPrice}</td></tr>
                </table>
            </div>
        </div>
        `
    });
};

module.exports = {
    sendWelcomeEmail,
    sendBookingEmail,
    sendOrderEmail
};