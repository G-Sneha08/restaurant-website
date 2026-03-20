const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// =========================
// WELCOME EMAIL
// =========================
const sendWelcomeEmail = async (email, name) => {

    const mailOptions = {
        from: `"Lumina Dine" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Lumina Dine 🍽️",
        html: `
        <h2>Hello ${name}!</h2>
        <p>Your account has been successfully created.</p>
        <p>You can now:</p>
        <ul>
            <li>Book restaurant tables</li>
            <li>Order food online</li>
        </ul>
        <p>Thank you for joining us!</p>
        `
    };

    await transporter.sendMail(mailOptions);
};



// =========================
// BOOKING CONFIRMATION
// =========================
const sendBookingEmail = async (email, name, date, time, guests) => {

    const mailOptions = {
        from: `"Lumina Dine" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Table Booking Confirmation 🍽️",
        html: `
        <h2>Reservation Confirmed</h2>

        <p>Hello ${name},</p>

        <p>Your table booking is confirmed.</p>

        <h3>Booking Details</h3>

        <ul>
            <li><b>Date:</b> ${date}</li>
            <li><b>Time:</b> ${time}</li>
            <li><b>Guests:</b> ${guests}</li>
        </ul>

        <p>We look forward to serving you!</p>
        `
    };

    await transporter.sendMail(mailOptions);
};



// =========================
// ORDER CONFIRMATION
// =========================
const sendOrderEmail = async (email, name, orderId, totalPrice) => {

    const mailOptions = {
        from: `"Lumina Dine" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Order Confirmation 🍔",
        html: `
        <h2>Order Confirmed</h2>

        <p>Hello ${name},</p>

        <p>Your order has been placed successfully.</p>

        <ul>
            <li><b>Order ID:</b> ${orderId}</li>
            <li><b>Total Price:</b> ₹${totalPrice}</li>
        </ul>

        <p>Your food will be prepared shortly.</p>

        <p>Thank you for ordering from Lumina Dine!</p>
        `
    };

    await transporter.sendMail(mailOptions);
};


module.exports = {
    sendWelcomeEmail,
    sendBookingEmail,
    sendOrderEmail
};