const axios = require("axios");

/**
 * =============================================================================
 * SENDINBLUE (BREVO) API INFRASTRUCTURE
 * =============================================================================
 */
const SENDINBLUE_API_KEY = (process.env.SENDINBLUE_API_KEY || "").trim();
const SENDER_EMAIL = "sneha901932@gmail.com"; // Verified sender for the Brevo account
const SENDER_NAME = "Lumina Dine";

// Diagnostic: Log API Key availability and format (masking most of it)
if (SENDINBLUE_API_KEY) {
    const keyPreview = SENDINBLUE_API_KEY.startsWith("xkeysib") 
        ? "V3 Key (Correct Format)" 
        : "Format seems unusual (V3 keys normally start with xkeysib-)";
    console.log(`📡 [MAIL_DIAGNOSTIC] Key Present: ${keyPreview}. ID Preview: ${SENDINBLUE_API_KEY.slice(0, 4)}... (Length: ${SENDINBLUE_API_KEY.length})`);
} else {
    console.error("❌ [MAIL_DIAGNOSTIC] SENDINBLUE_API_KEY IS MISSING IN LOGS.");
}

/**
 * Robust Wrapper to dispatch emails via Brevo API with detailed tracking
 */
const sendMailHelper = async (options) => {
    try {
        if (!SENDINBLUE_API_KEY) {
            console.error("❌ [MAIL_FAILURE] Missing SENDINBLUE_API_KEY environment variable.");
            return null;
        }

        console.log(`📡 [MAIL_QUEUE] Attempting delivery to: ${options.to} via Brevo API`);

        const data = {
            sender: {
                name: SENDER_NAME,
                email: SENDER_EMAIL
            },
            to: [
                {
                    email: options.to,
                    name: options.name || options.to
                }
            ],
            subject: options.subject,
            htmlContent: options.html
        };

        const response = await axios.post("https://api.brevo.com/v3/smtp/email", data, {
            headers: {
                "api-key": SENDINBLUE_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        if (response.status === 201 || response.status === 200) {
            console.log(`✅ [MAIL_SUCCESS] Delivered! MessageID: ${response.data.messageId}`);
            return response.data;
        } else {
            console.error(`❌ [MAIL_FAILURE] Brevo API responded with status ${response.status}:`, response.data);
            return null;
        }
    } catch (err) {
        const errorDetail = err.response ? JSON.stringify(err.response.data) : err.message;
        console.error(`❌ [MAIL_FAILURE] Transmission error: ${errorDetail}`);
        if (errorDetail.includes("unauthorized") || errorDetail.includes("Key not found")) {
            console.error("💡 PRO-TIP: Your Brevo V3 API key must start with 'xkeysib-'. Check Render Dashboard to ensure it was entered correctly.");
        }
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
};

const sendBookingEmail = async (email, name, date, time, guests) => {
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
};

const sendOrderEmail = async (email, name, orderId, totalPrice) => {
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
};

module.exports = {
    sendWelcomeEmail,
    sendBookingEmail,
    sendOrderEmail
};