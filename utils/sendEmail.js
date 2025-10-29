const nodemailer = require('nodemailer');

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // 'smtp.gmail.com'
    port: process.env.EMAIL_PORT, // 465
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // your-email@gmail.com
        pass: process.env.EMAIL_PASS, // your-16-char-app-password
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Voyage" <${process.env.EMAIL_USER}>`, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            html: html, // html body
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email.");
    }
};

module.exports = sendEmail;