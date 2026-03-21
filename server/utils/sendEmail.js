const nodemailer = require("nodemailer");

/**
 * ==========================================
 * EMAIL CONFIGURATION (PRODUCTION READY)
 * ==========================================
 */
const EMAIL_USER = (process.env.EMAIL_USER || "sneha901932@gmail.com").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "harzjwlgjsbazgrh").trim();

// Use 'service: gmail' which handles a lot of complexity internally
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    // SSL is implicitly handled by service: 'gmail', but adding these for extra reliability
    tls: {
       rejectUnauthorized: false
    }
});

// Immediate Verification of SMTP connection
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ [SMTP_CRITICAL] Authentication failed for: " + EMAIL_USER);
        console.error("❌ [SMTP_DETAIL] Error: " + error.message);
    } else {
        console.log("✅ [SMTP_READY] Gmail Outbound connection verified: " + EMAIL_USER);
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
            ...options
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [MAIL_SUCCESS] Delivered! Message-ID: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`❌ [MAIL_FAILURE] Transmission to ${options.to} aborted. Error: ${err.message}`);
        // Return null instead of throwing - we want the main application flow (registration, order) 
        // to complete successfully even if the email notification fails due to provider issues.
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
            <p>We are absolutely thrilled to have you join our community of food enthusiasts. Your account has been successfully created with <b>Sneha's Restaurant Website</b>.</p>
            <p>Indulge yourself with:</p>
            <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
                <ul style="padding-left: 20px; color: #555; line-height: 1.8;">
                    <li>✨ <b>Exclusive Table Access:</b> Book your preferred spot in seconds.</li>
                    <li>✨ <b>Seamless Orders:</b> Get gourmet delicacies delivered to your door.</li>
                    <li>✨ <b>Past History:</b> Review all your exquisite dining moments.</li>
                </ul>
            </div>
            <p style="color: #666;">We look forward to serving you with clinical precision and gastronomic perfection.</p>
            <div style="margin-top: 35px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999;">
                &copy; 2026 Lumina Dine. Sent with passion from Bengaluru.
            </div>
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
        subject: `Your Reservation is Confirmed - ${date} 📅`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; border-radius: 12px; border: 1px solid #ddd; max-width: 600px; margin: auto; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #d4af37; margin: 0;">LUMINA DINE</h1>
            </div>
            <h2 style="color: #2ecc71; text-align: center; margin-top: 0;">Reservation Confirmed!</h2>
            <p>Greetings ${name || 'Valued Guest'},</p>
            <p>Your table has been successfully secured. We are preparing for your arrival.</p>
            <div style="background: #fdfdfd; padding: 25px; border-radius: 10px; border: 1px solid #f1f1f1; margin: 25px 0;">
                <h4 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Booking Summary</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #666;">Date</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333;">${date}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Time</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333;">${time}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Guests</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333;">${guests} Guest(s)</td></tr>
                </table>
            </div>
            <p style="text-align: center; font-style: italic; color: #555;">We look forward to providing you with an unforgettable culinary atmosphere.</p>
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
        subject: `Order Success: Indulgence #${orderId} Received! 🍔`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; border-radius: 12px; border: 1px solid #ddd; max-width: 600px; margin: auto; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #d4af37; margin: 0;">LUMINA DINE</h1>
            </div>
            <h2 style="color: #3498db; text-align: center; margin-top: 0;">Order Received with Gratitude!</h2>
            <p>Hello ${name},</p>
            <p>Your selection of gourmet flavors is currently being handcrafted by our master chefs.</p>
            <div style="background: #fdfdfd; padding: 25px; border-radius: 10px; border: 1px solid #f1f1f1; margin: 25px 0;">
                <h4 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Details</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #666;">Order ID</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333;">#${orderId}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Total Amount</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #3498db;">₹${totalPrice}</td></tr>
                </table>
            </div>
            <p style="text-align: center; color: #555;">Sit back and relax as we prepare to deliver excellence to your doorstep.</p>
            <p style="text-align: center; font-weight: bold; color: #d4af37;">Thank you for trusting Lumina Dine.</p>
        </div>
        `
    });
};

module.exports = {
    sendWelcomeEmail,
    sendBookingEmail,
    sendOrderEmail
};