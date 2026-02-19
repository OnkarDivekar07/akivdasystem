const nodemailer = require('nodemailer');
const moment = require('moment');
const crypto = require('crypto');
const  User = require('../models/userdetails')
require('dotenv').config();  // For environment variables

// Function to generate a random OTP (6-digit number)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();  // Generates a 6-character OTP
};

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
    const emailContent = `
        <h2>🔐 OTP for Login</h2>
        <p>Your OTP for login is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
    `;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const messageData = {
        from: `"Your Service" <${process.env.EMAIL_USER}>`,  // Your email
        to: email,  // User's email
        subject: "Your OTP for Login",
        html: emailContent,
    };

    try {
        await transporter.sendMail(messageData);
        console.log('OTP email sent successfully');
    } catch (err) {
        console.error("Error sending OTP email:", err);
    }
};

// API for verifying email and sending OTP
exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    // Check if the provided email matches the admin email from .env
    if (email !== process.env.ADMIN_EMAIL) {
        return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    
    const otp = generateOTP();
    const otpExpiry = moment().add(10, 'minutes').toISOString();  // OTP expiry time set to 10 minutes
     
    // Save OTP and its expiry time to the database (You should implement this)
    try {
        await User.update(
            { otp, otpExpiry },  // Update the OTP and expiry time in the database
            { where: { email: email } }
        );

        // Send OTP email to the user
        await sendOTPEmail(email, otp);

        return res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error in sending OTP:', error);
        return res.status(500).json({ success: false, message: 'An error occurred' });
    }
};


exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Check if email matches admin email
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        // Find user
        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if OTP exists
        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new one."
            });
        }

        // Check if OTP is expired
        const currentTime = moment();
        if (currentTime.isAfter(moment(user.otpExpiry))) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // OTP is valid — clear OTP from DB
        await User.update(
            { otp: null, otpExpiry: null },
            { where: { email: email } }
        );

        return res.json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred"
        });
    }
};
