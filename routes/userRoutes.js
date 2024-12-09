const express = require('express');
const { getUsers, createUser, deleteUser, updateUser, getUserById,searchUser } = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermissions');
const isAdmin=require('../middleware/isAdminMiddleware')
const {validate,registerValidation}=require('../validations/validator')
const router = express.Router();
router.get('/', authenticateToken,checkPermission('view_alluser'), getUsers);
router.get('/:id',authenticateToken,checkPermission('view_user'),getUserById)
router.post('/', authenticateToken,isAdmin,checkPermission('create_user'),validate(registerValidation),createUser);
router.put('/:id',authenticateToken,checkPermission('update_user'),updateUser)
router.delete('/:id', authenticateToken, checkPermission('delete_user'), deleteUser);
router.get('/search', authenticateToken,isAdmin,searchUser);
module.exports = router;
