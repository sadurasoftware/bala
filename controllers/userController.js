const User = require('../models/User');
const logger = require('../utils/logger');
const { hashPassword } = require('../utils/hash');
const Role = require('../models/Role');
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const users = await User.find()
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .select('-password') 
            .populate('role', 'name');
        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limitNumber);
        res.status(200).json({
            message: 'Users fetched successfully',
            totalUsers,
            totalPages,
            currentPage: pageNumber,
            users,
        });
    } catch (err) {
        logger.error(`Error fetching users: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate('role', 'name permissions');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User fetched successfully',
            user,
        });
    } catch (err) {
        logger.error(`Error fetching user by ID: ${err.message}`);
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
const searchUser = async (req, res) => {
    try {
        const { role, searchQuery } = req.query;
        if (!role && !searchQuery) {
            return res.status(400).json({ message: 'Please provide a search parameter: role or searchQuery' });
        }
        let query = {};
        if (role) {
            const roleDoc = await Role.findOne({ name: role });
            if (!roleDoc) {
                return res.status(404).json({ message: 'Role not found' });
            }
            query.role = roleDoc._id;
        }
        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            query.$or = [{ username: regex }, { email: regex }];
        }

        const user = await User.find(query).populate('role', 'name permissions');
        if (user.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json({
            message: 'Users fetched successfully',
            users: user,
        });
    } catch (err) {
        logger.error(`Error searching user: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { getUsers,getUserById,createUser,updateUser,deleteUser,searchUser };
