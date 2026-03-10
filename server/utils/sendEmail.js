const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// ================================
// EMAIL TEMPLATE WRAPPER
// ================================
const emailTemplate = (title, content) => {

    return `
    <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:30px;">
        
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 5px 20px rgba(0,0,0,0.1);">

            <div style="background:#ff5a5f; color:white; padding:20px; text-align:center;">
                <h1 style="margin:0;">Lumina Dine 🍽️</h1>
                <p style="margin:5px 0;">Premium Restaurant Experience</p>
            </div>

            <div style="padding:30px;">
                <h2 style="color:#333;">${title}</h2>
                ${content}
            </div>

            <div style="background:#fafafa; padding:15px; text-align:center; font-size:12px; color:#777;">
                <p>© 2026 Lumina Dine</p>
                <p>Thank you for choosing our restaurant!</p>
            </div>

        </div>

    </div>
    `;
};



// ================================
// WELCOME EMAIL
// ================================
const sendWelcomeEmail = async (email, name) => {

    const content = `
        <p>Hello <b>${name}</b>,</p>

        <p>Welcome to <b>Lumina Dine</b>! 🎉</p>

        <p>Your account has been successfully created.</p>

        <ul>
            <li>🍽️ Book restaurant tables</li>
            <li>🍔 Order delicious food</li>
            <li>⭐ Enjoy premium dining</li>
        </ul>

        <p>We are excited to serve you!</p>
    `;

    const mailOptions = {
        from: `"Lumina Dine" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Lumina Dine 🍽️",
        html: emailTemplate("Welcome to Lumina Dine!", content)
    };

    await transporter.sendMail(mailOptions);
};



// ================================
// BOOKING CONFIRMATION
// ================================
const sendBookingEmail = async (email, name, date, time, guests) => {

    const content = `
        <p>Hello <b>${name}</b>,</p>

        <p>Your table booking has been <b>confirmed</b> ✅</p>

        <table style="width:100%; border-collapse:collapse; margin-top:15px;">
            <tr>
                <td style="padding:10px; border-bottom:1px solid #ddd;">📅 Date</td>
                <td style="padding:10px; border-bottom:1px solid #ddd;"><b>${date}</b></td>
            </tr>

            <tr>
                <td style="padding:10px; border-bottom:1px solid #ddd;">⏰ Time</td>
                <td style="padding:10px; border-bottom:1px solid #ddd;"><b>${time}</b></td>
            </tr>

            <tr>
                <td style="padding:10px;">👥 Guests</td>
                <td style="padding:10px;"><b>${guests}</b></td>
            </tr>
        </table>

        <p style="margin-top:20px;">
        We look forward to serving you at <b>Lumina Dine</b>.
        </p>
    `;

    const mailOptions = {
        from: `"Lumina Dine" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Table Booking is Confirmed 🍽️",
        html: emailTemplate("Booking Confirmation", content)
    };

    await transporter.sendMail(mailOptions);
};



// ================================
// ORDER CONFIRMATION
// ================================
const sendOrderEmail = async (email, name, orderId, totalPrice) => {

    const content = `
        <p>Hello <b>${name}</b>,</p>

        <p>Your food order has been placed successfully. 🎉</p>

        <table style="width:100%; border-collapse:collapse; margin-top:15px;">

            <tr>
                <td style="padding:10px; border-bottom:1px solid #ddd;">Order ID</td>
                <td style="padding:10px; border-bottom:1px solid #ddd;"><b>#${orderId}</b></td>
            </tr>

            <tr>
                <td style="padding:10px;">Total Amount</td>
                <td style="padding:10px;"><b>₹${totalPrice}</b></td>
            </tr>

        </table>

        <p style="margin-top:20px;">
        Our chefs are preparing your delicious meal 👨‍🍳
        </p>
    `;

    const mailOptions = {
        from: `"Lumina Dine" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Order Confirmation 🍔",
        html: emailTemplate("Order Confirmed", content)
    };

    await transporter.sendMail(mailOptions);
};



module.exports = {
    sendWelcomeEmail,
    sendBookingEmail,
    sendOrderEmail
};