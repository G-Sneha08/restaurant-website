const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// ================= WELCOME EMAIL =================
const sendWelcomeEmail = async (email, name) => {

    try {

        const mailOptions = {
            from: `"Lumina Dine" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to Lumina Dine 🍽️",
            html: `
                <h2>Welcome to Lumina Dine</h2>

                <p>Hello <b>${name}</b>,</p>

                <p>Your account has been successfully created.</p>

                <p>You can now:</p>

                <ul>
                    <li>Book restaurant tables</li>
                    <li>Order delicious food</li>
                    <li>Track your bookings</li>
                </ul>

                <p>Thank you for joining us!</p>

                <br>

                <p>Team Lumina Dine</p>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log("Welcome email sent");

    } catch (error) {

        console.error("Email error:", error);

    }

};



// ================= BOOKING EMAIL =================
const sendBookingEmail = async (email, name, date, time, guests) => {

    try {

        const mailOptions = {
            from: `"Lumina Dine" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Table Booking Confirmation 🍽️",
            html: `
                <h2>Reservation Confirmed</h2>

                <p>Hello <b>${name}</b>,</p>

                <p>Your table has been successfully reserved.</p>

                <h3>Booking Details</h3>

                <ul>
                    <li><b>Date:</b> ${date}</li>
                    <li><b>Time:</b> ${time}</li>
                    <li><b>Guests:</b> ${guests}</li>
                </ul>

                <p>We look forward to serving you.</p>

                <br>

                <p>Team Lumina Dine</p>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log("Booking confirmation email sent");

    } catch (error) {

        console.error("Email error:", error);

    }

};

module.exports = {
    sendWelcomeEmail,
    sendBookingEmail
};