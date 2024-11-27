const Permission = require('../models/permission');
const logger = require('../utils/logger');
const createPermission = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingPermission = await Permission.findOne({ name });
        if (existingPermission) {
            return res.status(400).json({ message: 'Permission already exists' });
        }
        const permission = new Permission({ name, description });
        await permission.save();
        logger.info(`Permission created: ${name}`);
        res.status(201).json({ message: 'Permission created successfully', permission });
    } catch (err) {
        logger.error(`Error creating permission: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

const viewPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find();
        res.status(200).json({ message: 'Permissions fetched successfully', permissions });
    } catch (err) {
        logger.error(`Error fetching permissions: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createPermission ,viewPermissions};
