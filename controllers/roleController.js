const Role = require('../models/Role');
const Permission = require('../models/permission');
const logger = require('../utils/logger');
const User = require('../models/User');
const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists' });
        }
        const permissionDocs = await Permission.find({ _id: { $in: permissions } });
        if (permissionDocs.length !== permissions.length) {
            return res.status(400).json({ message: 'Invalid permissions provided' });
        }

        const role = new Role({ name, permissions });
        await role.save();

        logger.info(`Role created: ${name}`);
        res.status(201).json({ message: 'Role created successfully', role });
    } catch (err) {
        logger.error(`Error creating role: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        if (name && name !== role.name) {
            const existingRole = await Role.findOne({ name });
            if (existingRole) {
                return res.status(400).json({ message: 'Role name already exists' });
            }
            role.name = name;
        }
        if (permissions) {
            const permissionDocs = await Permission.find({ _id: { $in: permissions } });
            if (permissionDocs.length !== permissions.length) {
                return res.status(400).json({ message: 'Invalid permissions provided' });
            }
            const existingPermissions = role.permissions.map((perm) => perm.toString());
            const newPermissions = permissions.filter(
                (perm) => !existingPermissions.includes(perm)
            );

            if (newPermissions.length === 0) {
                return res
                    .status(400)
                    .json({ message: 'Permissions already exist, no updates needed' });
            }

            role.permissions = [...existingPermissions, ...newPermissions];
        }
        await role.save();
        logger.info(`Role updated: ${role.name}`);
        res.status(200).json({ message: 'Role updated successfully', role });
    } catch (err) {
        logger.error(`Error updating role: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

// const deleteRole = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const role = await Role.findByIdAndDelete(id);
//         if (!role) {
//             return res.status(404).json({ message: 'Role not found' });
//         }

//         logger.info(`Role deleted: ${role.name}`);
//         res.status(200).json({ message: 'Role deleted successfully' });
//     } catch (err) {
//         logger.error(`Error deleting role: ${err.message}`);
//         res.status(500).json({ message: 'Server error' });
//     }
// };
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findById(id).populate('permissions');
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        const usersWithRole = await User.find({ role: id });
        if (usersWithRole.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete role: It is assigned to one or more users',
            });
        }
        const permissionIds = role.permissions.map((perm) => perm._id);
        await Role.findByIdAndDelete(id);
        await Permission.deleteMany({ _id: { $in: permissionIds } });
        logger.info(`Role deleted: ${role.name}`);
        res.status(200).json({ message: 'Role and associated permissions deleted successfully' });
    } catch (err) {
        logger.error(`Error deleting role: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};
const viewRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('permissions', 'name'); 
        res.status(200).json({ message: 'Roles fetched successfully', roles });
    } catch (err) {
        logger.error(`Error fetching roles: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

const deletePermissionFromRole = async (req, res) => {
    try {
        const { roleId, permissionId } = req.body;
        const role = await Role.findById(roleId).populate('permissions');
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        const permissionIndex = role.permissions.findIndex(
            (permission) => permission._id.toString() === permissionId
        );

        if (permissionIndex === -1) {
            return res.status(404).json({ message: 'Permission not found in role' });
        }
        role.permissions.splice(permissionIndex, 1);
        await role.save();
        logger.info(`Permission removed from role: ${role.name}`);
        res.status(200).json({
            message: 'Permission removed from role successfully',
            role,
        });
    } catch (err) {
        logger.error(`Error removing permission: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createRole,updateRole,deleteRole,viewRoles ,deletePermissionFromRole};
