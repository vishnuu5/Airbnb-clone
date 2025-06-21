const nodemailer = require("nodemailer")

// Generate a 6-digit OTP
exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via email
exports.sendOTP = async (email, otp) => {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })

        // Email content
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: "Email Verification OTP",
            html: `
                <h1>Email Verification</h1>
                <p>Your OTP for email verification is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this OTP, please ignore this email.</p>
            `
        }

        // Send email
        await transporter.sendMail(mailOptions)
        console.log(`OTP sent to ${email}`)
    } catch (error) {
        console.error("Error sending OTP:", error)
        throw new Error("Failed to send OTP")
    }
}

// Verify OTP
exports.verifyOTP = (storedOTP, inputOTP) => {
    return storedOTP === inputOTP
} 