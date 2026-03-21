const nodemailer = require("nodemailer");

// =========================
// CONFIGURATION
// =========================
const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").trim();

const transporter = nodemailer.createTransport({
    service: "gmail",
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
        console.warn("   [MAIL_SYSTEM] Hint: Ensure EMAIL_USER/EMAIL_PASS are correct and App Passwords are used for Gmail.");
    } else {
        console.log("📧 [MAIL_SYSTEM] SMTP Ready - Connection Verified");
    }
});


/**
 * Helper to send email with consistent logging
 */
const sendMailHelper = async (options) => {
    try {
        console.log(`📧 [MAIL_QUEUE] Sending ${options.subject} to: ${options.to}`);
        const info = await transporter.sendMail({
            from: `"Lumina Dine" <${EMAIL_USER}>`,
            ...options
        });
        console.log(`✅ [MAIL_SUCCESS] Sent: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`❌ [MAIL_FAILURE] To: ${options.to} | Error: ${err.message}`);
        // We do not throw here to avoid crashing the caller (e.g. registration flow),
        // but we log it heavily.
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
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #d4af37;">Hello ${name}!</h2>
            <p>Your journey with the finest dining experience has successfully begun.</p>
            <p>With your new account, you can now:</p>
            <ul style="line-height: 1.6;">
                <li><b>Exquisite Bookings:</b> Reserve your preferred table in seconds.</li>
                <li><b>Gourmet Orders:</b> Enjoy our chef's specials from the comfort of your home.</li>
            </ul>
            <p>We are delighted to have you with us!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8rem; color: #888;">Lumina Dine | Experience the Taste of Excellence</p>
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
        subject: "Reservation Confirmed: Table for ${guests} 🍽️",
        html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #2ecc71;">Reservation Confirmed</h2>
            <p>Greetings ${name || 'Valued Guest'},</p>
            <p>Your table booking has been successfully secured for an exquisite dining experience.</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #333;">Booking Summary</h4>
                <p style="margin: 5px 0;">📅 <b>Date:</b> ${date}</p>
                <p style="margin: 5px 0;">⏰ <b>Time:</b> ${time}</p>
                <p style="margin: 5px 0;">👥 <b>Guests:</b> ${guests}</p>
            </div>

            <p>We look forward to serving you with our finest delicacies.</p>
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
        subject: "Order Placed Successfully: #${orderId} 🍔",
        html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #3498db;">Indulgence Confirmed</h2>
            <p>Hello ${name},</p>
            <p>Your exquisite selection is being prepared with perfection.</p>

            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #333;">Order Details</h4>
                <p style="margin: 5px 0;">📦 <b>Order ID:</b> #${orderId}</p>
                <p style="margin: 5px 0;">💰 <b>Total Amount:</b> ₹${totalPrice}</p>
            </div>

            <p>Your culinary journey will reach you shortly.</p>
            <p>Thank you for choosing Lumina Dine!</p>
        </div>
        `
    });
};

module.exports = {
    sendWelcomeEmail,
    sendBookingEmail,
    sendOrderEmail
};