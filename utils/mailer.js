const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { generateInvoicePdf } = require('./createInvoice'); // .js not needed in CJS

// Configure the email transporter using your .env variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an OTP email to a user.
 * @param {string} to - The recipient's email address.
 * @param {string} otp - The 4-digit One-Time Password.
 */
const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Voyage" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Verification Code for Voyage',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
        <h2 style="color: #0d9488; text-align: center;">Welcome to Voyage!</h2>
        <p style="text-align: center;">Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 30px 0; color: #0d9488;">${otp}</p>
        <p style="text-align: center; font-size: 14px;">This code is valid for 10 minutes.</p>
        <p style="text-align: center; font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${to}:`, error);
    throw new Error('Could not send verification email.');
  }
};

/**
 * Sends a booking confirmation email with an invoice.
 * @param {string} to - The recipient's email address.
 * @param {object} bookingDetails - The booking request object.
 */
const sendBookingConfirmationEmail = async (to, bookingDetails) => {
    const { clientName, packageName, date, guests, totalAmount, transactionId } = bookingDetails;
    const formattedDate = new Date(date).toLocaleString('en-IN');
    
    // --- FIX: Write to Vercel's temporary /tmp directory ---
    const invoicesDir = path.join('/tmp', 'invoices');
    if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
    }
    const invoicePath = path.join(invoicesDir, `invoice-${transactionId}.pdf`);

    try {
        await generateInvoicePdf(bookingDetails, invoicePath);

        const mailOptions = {
            from: `"Voyage" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Your Voyage Booking for ${packageName} is Confirmed!`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                    <h1 style="color: #0d9488; text-align: center;">Booking Confirmed!</h1>
                    <h2>Thank You for Your Booking, ${clientName}!</h2>
                    <p>We are thrilled to confirm your adventure with Voyage. Get ready for an unforgettable experience to <strong>${packageName}</strong>!</p>
                    <h3>Your Trip Details:</h3>
                    <ul>
                        <li><strong>Package:</strong> ${packageName}</li>
                        <li><strong>Date:</strong> ${formattedDate}</li>
                        <li><strong>Number of Guests:</strong> ${guests}</li>
                        <li><strong>Total Amount Paid:</strong> ₹${totalAmount.toLocaleString('en-IN')}</li>
                        <li><strong>Transaction ID:</strong> ${transactionId}</li>
                    </ul>
                    <p><strong>Your detailed invoice is attached to this email as a PDF for your records.</strong></p>
                    <hr style="border-top: 1px solid #eee; margin: 20px 0;">
                    <h3>A Few Tips for Your Upcoming Trip:</h3>
                    <ul>
                        <li><strong>Pack Accordingly:</strong> Remember to check the weather forecast for your destination.</li>
                        <li><strong>Stay Curious:</strong> The best adventures happen when you explore with an open mind.</li>
                        <li><strong>Share Your Journey:</strong> Don't forget to tag us in your photos! @VoyageTravel</li>
                    </ul>
                    <p style="text-align: center; margin-top: 30px;">We wish you a fantastic and memorable journey!</p>
                    <p><strong>The Voyage Team</strong></p>
                </div>
            `,
            attachments: [{
                filename: `Voyage-Invoice-${transactionId}.pdf`,
                path: invoicePath,
                contentType: 'application/pdf',
            }],
        };

        await transporter.sendMail(mailOptions);
        console.log(`Booking confirmation and PDF invoice sent to ${to}`);
    } catch (error) {
        console.error('Error in sendBookingConfirmationEmail:', error);
    } finally {
        if (fs.existsSync(invoicePath)) {
            fs.unlinkSync(invoicePath);
        }
    }
};

/**
 * Sends a response from the admin to a user's contact query.
 * @param {string} to - The recipient's email address.
 * @param {string} name - The recipient's name.
 * @param {string} subject - The subject of the original query.
 * @param {string} response - The admin's response text.
 */
const sendAdminResponseEmail = async (to, name, subject, response) => {
    const mailOptions = {
        from: `"Voyage Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Re: ${subject}`,
        html: `
            <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
                <h3>Hello ${name},</h3>
                <p>Thank you for contacting Voyage. Here is the response to your query:</p>
                <div style="background-color: #f9f9f9; border-left: 4px solid #0d9488; padding: 15px; margin: 20px 0;">
                    <p>${response.replace(/\n/g, '<br>')}</p>
                </div>
                <p>If you have any further questions, please feel free to reply to this email.</p>
                <p>Best regards,</p>
                <p><strong>The Voyage Support Team</strong></p>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendBookingConfirmationEmail, sendAdminResponseEmail };