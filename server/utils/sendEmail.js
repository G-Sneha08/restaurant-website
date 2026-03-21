const nodemailer = require("nodemailer");

// =========================
// CONFIGURATION
// =========================
const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").trim();

// Using explicit host/port for Gmail as it's often more reliable than 'service: gmail'
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ [MAIL_SYSTEM] SMTP Configuration failure:", error.message);
        if (EMAIL_USER.includes("example") || EMAIL_USER.includes("yourgmail")) {
            console.error("⚠️ [MAIL_SYSTEM] ALERT: EMAIL_USER looks like a placeholder. Please update it in .env.");
        }
    } else {
        console.log("📧 [MAIL_SYSTEM] SMTP Ready - Connection Verified");
    }
});


/**
 * Helper to send email with consistent logging
 */
const sendMailHelper = async (options) => {
    try {
        console.log(`📧 [MAIL_QUEUE] Preparing to send: ${options.subject} to: ${options.to}`);
        
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.error("❌ [MAIL_FAILURE] Missing email credentials in environment variables.");
            return null;
        }

        const info = await transporter.sendMail({
            from: `"Lumina Dine" <${EMAIL_USER}>`,
            ...options
        });
        console.log(`✅ [MAIL_SUCCESS] Sent! MessageID: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`❌ [MAIL_FAILURE] Distribution to ${options.to} aborted. Error: ${err.message}`);
        return null;
    }
};

// =========================
// WELCOME EMAIL
// =========================
const sendWelcomeEmail = async (email, name) => {
    if (!email) return;
    
    return await sendMailHelper({
        to: email,
        subject: "Welcome to Lumina Dine 🍽️",
        html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #333; max-width: 600px; margin: auto;">
            <div style="text-align: center; margin-bottom: 20px;">
                 <h1 style="color: #d4af37; margin-bottom: 5px;">LUMINA DINE</h1>
                 <p style="text-transform: uppercase; font-size: 0.8rem; letter-spacing: 2px; color: #888;">Experience the Taste of Excellence</p>
            </div>
            <h2 style="color: #333;">Welcome, ${name}!</h2>
            <p>Your journey with the finest dining experience has officially begun. We are thrilled to have you as part of our culinary family.</p>
            <p>You can now indulge in:</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 10px;">✨ <b>Signature Tables:</b> Reserve your spot in seconds.</li>
                    <li style="margin-bottom: 10px;">✨ <b>Gourmet Delivery:</b> Order chef-crafted meals to your door.</li>
                    <li>✨ <b>Exclusive Previews:</b> Be the first to know about our seasonal menus.</li>
                </ul>
            </div>
            <p>We look forward to serving you soon!</p>
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #888; font-size: 0.8rem;">
                <p>&copy; 2026 Lumina Dine. All rights reserved.</p>
            </div>
        </div>
        `
    });
};

// =========================
// BOOKING CONFIRMATION
// =========================
const sendBookingEmail = async (email, name, date, time, guests) => {
    if (!email) return;

    return await sendMailHelper({
        to: email,
        subject: `Your Reservation is Confirmed - ${date} 🍽️`,
        html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #333; max-width: 600px; margin: auto;">
             <div style="text-align: center; margin-bottom: 20px;">
                 <h1 style="color: #d4af37; margin-bottom: 5px;">LUMINA DINE</h1>
            </div>
            <h2 style="color: #2ecc71; text-align: center;">Reservation Confirmed</h2>
            <p>Greetings ${name || 'Valued Guest'},</p>
            <p>We are delighted to confirm your upcoming visit to Lumina Dine.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f1f1;">
                <h4 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Booking Details</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px 0; color: #666;">Date</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${date}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666;">Time</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${time}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666;">Guests</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${guests} Person(s)</td></tr>
                </table>
            </div>

            <p style="text-align: center; font-style: italic;">We look forward to serving you with clinical precision and gastronomic excellence.</p>
        </div>
        `
    });
};

// =========================
// ORDER CONFIRMATION
// =========================
const sendOrderEmail = async (email, name, orderId, totalPrice) => {
    if (!email) return;

    return await sendMailHelper({
        to: email,
        subject: `Indulgence Received: Order #${orderId} 🍔`,
        html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #333; max-width: 600px; margin: auto;">
            <div style="text-align: center; margin-bottom: 20px;">
                 <h1 style="color: #d4af37; margin-bottom: 5px;">LUMINA DINE</h1>
            </div>
            <h2 style="color: #3498db; text-align: center;">Order Placed Successfully</h2>
            <p>Hello ${name},</p>
            <p>Your selection of exquisite flavors is now being prepared for you.</p>

            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f1f1;">
                <h4 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px 0; color: #666;">Order ID</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">#${orderId}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666;">Total Amount</td><td style="padding: 5px 0; font-weight: bold; text-align: right; color: #2ecc71;">₹${totalPrice}</td></tr>
                </table>
            </div>

            <p style="text-align: center;">Your culinary journey will reach your doorstep very soon.</p>
            <p style="text-align: center; font-weight: bold;">Thank you for trusting Lumina Dine.</p>
        </div>
        `
    });
};

module.exports = {
    sendWelcomeEmail,
    sendBookingEmail,
    sendOrderEmail
};