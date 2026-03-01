const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "yourgmail@gmail.com",   // your gmail
                pass: "your_app_password"      // app password (not gmail password)
            }
        });

        const mailOptions = {
            from: "yourgmail@gmail.com",
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");

    } catch (error) {
        console.error("Email error:", error);
    }
};

module.exports = sendEmail;