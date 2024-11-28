const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
    },
});

const passwordResetEmail = async (to, url, username) => {
    const htmlContent = `
        <div style="width: 100%; max-width: 600px; margin: auto; padding: 20px; background: #f4f4f4; border: 1px solid #ddd;">
            <h2 style="color: #444; text-align: center;">Password Reset</h2>
            <p>Hello ${username},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        </div>
    `;

    return await transporter.sendMail({
        from: process.env.APP_EMAIL,
        to,
        subject: 'Password Reset Request',
        html: htmlContent,
    });
};

module.exports = { passwordResetEmail };
