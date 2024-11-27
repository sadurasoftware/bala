const User = require('../models/User');
const logger = require('../utils/logger');
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('role');
        if (!user) {
            logger.warn(`Admin check failed: User not found for ID ${req.user.id}`);
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role.name !== 'admin') {
            logger.info(`Access denied: User ${user.username} (ID: ${req.user.id}) is not an admin`);
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        logger.info(`Admin access granted: User ${user.username} (ID: ${req.user.id})`);
        next();
    } catch (err) {
        logger.error(`Error in admin check: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = isAdmin;
