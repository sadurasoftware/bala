const { hashPassword, verifyPassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');
const Role = require('../models/Role');

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

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate({
            path: 'role',
            populate: { path: 'permissions' }, 
        });
        if (!user) {
            logger.warn(`Login failed: User not found with email ${email}`);
            return res.status(404).json({ message: 'User not found' });
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

module.exports = { registerUser, loginUser,logoutUser };
