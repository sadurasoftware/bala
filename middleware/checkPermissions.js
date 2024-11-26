const User = require('../models/User');
const logger=require('../utils/logger')
const checkPermission = (requiredPermission) => async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'role',
            populate: { path: 'permissions' },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userPermissions = user.role.permissions.map((perm) => perm.name);
        if (!userPermissions.includes(requiredPermission)) {
            logger.info(`Access denied for user: ${user}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = checkPermission;
