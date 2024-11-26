const User = require('../models/User');
const logger = require('../utils/logger');
const { hashPassword } = require('../utils/hash');
const Role = require('../models/Role');
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const users = await User.find()
            .populate('role', 'name permissions') 
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments();

        res.status(200).json({
            message: 'Users fetched successfully',
            totalUsers,
            users,
        });
    } catch (err) {
        logger.error(`Error fetching users: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};


const createUser = async (req, res) => {
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
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role:roleDoc._id,
        });
        await user.save();

        logger.info(`User created: ${username}`);
        res.status(201).json({ message: 'User created successfully', user });
    } catch (err) {
        logger.error(`Error creating user: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = await hashPassword(password);
        if (role) {
            const roleDoc = await Role.findOne({ name: role });
            if (!roleDoc) {
                return res.status(400).json({ message: 'Invalid role specified' });
            }
            user.role = roleDoc._id;
        }

        await user.save();
        logger.info(`User updated: ${user.username}`);
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (err) {
        logger.error(`Error updating user: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info(`User deleted: ${user.username}`);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        logger.error(`Error deleting user: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { getUsers, createUser,updateUser,deleteUser };
