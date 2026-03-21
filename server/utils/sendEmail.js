const axios = require("axios");
const nodemailer = require("nodemailer");

/**
 * =============================================================================
 * SENDINBLUE (BREVO) SMART INFRASTRUCTURE
 * =============================================================================
 */
const SENDINBLUE_API_KEY = (process.env.SENDINBLUE_API_KEY || "").trim();
const SENDER_EMAIL = "sneha901932@gmail.com"; 
const SENDER_NAME = "Lumina Dine";

/**
 * Robust Wrapper to dispatch emails. 
 * Detects if the key is an API V3 Key (xkeysib-) or an SMTP Key (32-char hex).
 */
const sendMailHelper = async (options) => {
    try {
        if (!SENDINBLUE_API_KEY) {
            console.error("❌ [MAIL_FAILURE] Missing SENDINBLUE_API_KEY environment variable. Emails cannot be sent.");
            return null;
        }

        if (!options.to) {
            console.error("❌ [MAIL_FAILURE] Recipient email (to) is missing.");
            return null;
        }

        console.log(`📡 [MAIL_QUEUE] Preparing email for: ${options.to} (${options.subject})`);

        // AUTO-DETECTION LOGIC
        const isV3ApiKey = SENDINBLUE_API_KEY.startsWith("xkeysib-");
        
        if (isV3ApiKey) {
            // MODE A: BREVO V3 HTTP API
            console.log(`📡 [MAIL_MODE] Protocol: Brevo V3 API (HTTP)`);
            const data = {
                sender: { name: SENDER_NAME, email: SENDER_EMAIL },
                to: [{ email: options.to, name: options.name || options.to }],
                subject: options.subject,
                htmlContent: options.html
            };

            const response = await axios.post("https://api.brevo.com/v3/smtp/email", data, {
                headers: {
                    "api-key": SENDINBLUE_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                timeout: 10000 // 10s timeout to prevent hanging
            });
            console.log(`✅ [MAIL_SUCCESS] API Delivered! MessageID: ${response.data.messageId}`);
            return response.data;

        } else {
            // MODE B: BREVO SMTP RELAY (Often used when 32-char hex keys are provided)
            console.log(`📡 [MAIL_MODE] Protocol: Brevo SMTP Relay (Nodemailer)`);
            const transporter = nodemailer.createTransport({
                host: "smtp-relay.brevo.com",
                port: 587,
                auth: {
                    user: SENDER_EMAIL,
                    pass: SENDINBLUE_API_KEY
                },
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 20000
            });

            const mailOptions = {
                from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
                to: options.to,
                subject: options.subject,
                html: options.html
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ [MAIL_SUCCESS] SMTP Delivered! MessageID: ${info.messageId}`);
            return info;
        }

    } catch (err) {
        // Detailed logging for Render logs
        const errorDetail = err.response ? JSON.stringify(err.response.data) : err.message;
        console.error(`❌ [MAIL_FAILURE] Transmission error: ${errorDetail}`);
        
        // We return null and do NOT throw, so the calling route can continue its logic (registration/booking)
        return null; 
    }
};

/**
 * EMAIL TEMPLATES - PREMIUM DESIGNS
 */

// Shared Header & Footer Logic
const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #111; padding: 40px 20px; text-align: center; color: #fff; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; color: #e67e22; }
        .content { padding: 40px; }
        .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        .btn { display: inline-block; padding: 12px 30px; background: #e67e22; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .info-box { background: #fff9f4; border-left: 4px solid #e67e22; padding: 15px; margin: 20px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Lumina Dine</h1></div>
        <div class="content">${content}</div>
        <div class="footer">
            <p>© 2026 Lumina Dine. All rights reserved.</p>
            <p>123 Culinary Avenue, Gourmet City</p>
        </div>
    </div>
</body>
</html>
`;

const sendWelcomeEmail = async (email, name) => {
    try {
        if (!email) return;
        const content = `
            <h2>Welcome to Lumina Dine, ${name}!</h2>
            <p>We're thrilled to have you as part of our culinary family. Prepare yourself for an exquisite dining experience that blends tradition with modern artistry.</p>
            <div class="info-box">
                <p><strong>Your Account:</strong> ${email}</p>
            </div>
            <p>Unlock gourmet rewards, manage your reservations, and track your orders all in one place.</p>
            <a href="https://restaurant-website-sneha.vercel.app" class="btn">Explore the Menu</a>
        `;
        return await sendMailHelper({
            to: email,
            name: name,
            subject: "Welcome to Lumina Dine 🍽️",
            html: getBaseTemplate(content)
        });
    } catch (e) {
        console.error("📧 [TEMPLATE_ERROR] Welcome email generation failed:", e.message);
        return null;
    }
};

const sendBookingEmail = async (email, name, date, time, guests) => {
    try {
        if (!email) return;
        const content = `
            <h2>Reservation Confirmed! 📅</h2>
            <p>Dear ${name || 'Valued Guest'}, your table awaits. We've locked in your spot for a memorable evening.</p>
            <div class="info-box">
                <p><strong>📅 Date:</strong> ${date}</p>
                <p><strong>🕒 Time:</strong> ${time}</p>
                <p><strong>👥 Guests:</strong> ${guests}</p>
            </div>
            <p>If you need to change your reservation or have special dietary requirements, please feel free to reach out to us.</p>
        `;
        return await sendMailHelper({
            to: email,
            name: name,
            subject: "Your Table is Confirmed at Lumina Dine 📅",
            html: getBaseTemplate(content)
        });
    } catch (e) {
        console.error("📧 [TEMPLATE_ERROR] Booking email generation failed:", e.message);
        return null;
    }
};

const sendOrderEmail = async (email, name, orderId, totalPrice) => {
    try {
        if (!email) return;
        const content = `
            <h2>Order Received! 🍔</h2>
            <p>Hello ${name}, we've received your order and our chefs are already working their magic.</p>
            <div class="info-box">
                <p><strong>🧾 Order ID:</strong> #${orderId}</p>
                <p><strong>💰 Total Amount:</strong> ₹${totalPrice}</p>
                <p><strong>📍 Status:</strong> Preparing with care</p>
            </div>
            <p>You'll receive another notification once your order is on its way. Sit back and relax!</p>
        `;
        return await sendMailHelper({
            to: email,
            name: name,
            subject: "Order Confirmation: #${orderId} - Lumina Dine 🍔",
            html: getBaseTemplate(content)
        });
    } catch (e) {
        console.error("📧 [TEMPLATE_ERROR] Order email generation failed:", e.message);
        return null;
    }
};

module.exports = {
    sendWelcomeEmail,
    sendBookingEmail,
    sendOrderEmail
};