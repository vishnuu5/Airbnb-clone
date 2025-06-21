const nodemailer = require("nodemailer")

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

// Send email function
exports.sendEmail = async ({ email, subject, message }) => {
    try {
        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: subject,
            text: message,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">${subject}</h2>
                    <p style="color: #666; line-height: 1.6;">${message}</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>`,
        })

        console.log("Message sent: %s", info.messageId)
        return info
    } catch (error) {
        console.error("Error sending email:", error)
        throw error
    }
} 