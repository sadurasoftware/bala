const User = require('../models/User');
const logger=require('../utils/logger')
const checkPermission = (requiredPermission) => async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'role',
            populate: { path: 'permissions' },
        });
        if (!user) {
            logger.warn('User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.role) {
            logger.warn(`Access denied: Role not assigned to user ${user.username}`);
            return res.status(403).json({ message: 'Access denied: Role not assigned' });
        }
        const userPermissions = user.role.permissions.map((perm) => perm.name);
        if (!userPermissions.includes(requiredPermission)) {
            logger.info(`Access denied for user: ${user.username} - Missing permission: ${requiredPermission}`);
            return res.status(403).json({ message: 'Access denied' });
        }
        logger.info(`Permission granted for user: ${user.username} - Permission: ${requiredPermission}`);
        next();
    } catch (err) {
        logger.error(`Error in permission check: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = checkPermission;
