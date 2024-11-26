const express = require('express');
const { getUsers, createUser, deleteUser, updateUser } = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermissions');
const isAdmin=require('../middleware/isAdminMiddleware')
const router = express.Router();
router.get('/', authenticateToken, checkPermission('view_user'), getUsers);
router.post('/', authenticateToken,isAdmin,checkPermission('create_user'), createUser);
router.put('/:id',authenticateToken,checkPermission('update_user'),updateUser)
router.delete('/:id', authenticateToken, checkPermission('delete_user'), deleteUser);

module.exports = router;
