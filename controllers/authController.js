const { hashPassword, verifyPassword } = require('../utils/hash');
const { generateToken,verifyToken } = require('../utils/jwt');
const emailHelper = require('../utils/emailHelper');
const User = require('../models/User');
const logger = require('../utils/logger');
const Role = require('../models/Role');
const jwt=require('jsonwebtoken')
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        const roleDoc = await Role.findOne({ name: role });
        if (!roleDoc) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }
        const hashedPassword = await hashPassword(password);
        const user = new User({username,email,password: hashedPassword,role: roleDoc._id,});
        await user.save();
        const token=generateToken({ username, email });
        const verificationUrl = `${process.env.VERIFICATION}${token}`;
        await emailHelper.verificationEmail(email, verificationUrl, username);
        logger.info(`User registered successfully: ${username}`);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: roleDoc.name, 
            },
        });
    } catch (err) {
        logger.error(`Error registering user: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};
const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.verified) {
            return res.status(400).json({ error: 'User is already verified' });
        }
        const token = jwt.sign({ username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '10m' });
        const verificationUrl = `${process.env.VERIFICATION_URL}?token=${token}`;
        emailHelper.verificationEmail(email, verificationUrl, user.username);
        return res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate({
            path: 'role',
            populate: { path: 'permissions' }, 
        });
        if (!user) {
            logger.warn(`Login failed: User not found with email ${email}`);
            return res.status(404).json({ message: 'Invalid email or password' });
        }
        if (!user.verified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            logger.warn(`Login failed: Invalid credentials for email ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateToken({id: user._id,role: user.role.name,});
        const permissions = user.role.permissions.map((perm) => perm.name);
        logger.info(`User logged in successfully: ${email}`);
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role.name, 
                permissions, 
            },
        });
    } catch (err) {
        logger.error(`Error logging in user: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn(`Forgetpassword failed: Email not found ${email}`);
            return res.status(404).json({ message: 'User not found' });
        }
        const token = generateToken({ id: user._id }, '15m');
        const resetLink = `${process.env.FORGET_PASSWORD_URL}?token=${token}`;

        await emailHelper.passwordResetEmail(user.email, resetLink, user.username);
        logger.info(`Password reset link sent successfully: ${email}`);
        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (err) {
        logger.error(`Email sending failed: ${err.message}`);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
const resetPassword = async (req, res) => {
    try {
        const { token } = req.body;
        const { newPassword } = req.body;
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (!user) {
            logger.warn(`Resetpassword failed: Usernot found ${user}`);
            return res.status(404).json({ message: 'User not found' });
        }
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();
        logger.info(`Password reset successfully: ${user}`)
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid or expired token', error: err.message });
    }
};
const logoutUser = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        logger.info('User logged out successfully (cookie cleared)');
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        logger.error(`Error during logout: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.verified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }
        user.verified = true;
        await user.save();
        logger.info(`Email verified: ${user.email}`);
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        logger.error(`Error verifying email: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { registerUser,resendVerificationEmail,forgetPassword,resetPassword,loginUser,logoutUser,verifyEmail };
