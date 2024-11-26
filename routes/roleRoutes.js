const express = require('express');
const roleController = require('../controllers/roleController');
const authenticateToken = require('../middleware/authMiddleware');
const checkPermission=require('../middleware/checkPermissions')
const isAdmin = require('../middleware/isAdminMiddleware');

const router = express.Router();

router.post('/roles', roleController.createRole);
router.put('/roles/:id', authenticateToken,isAdmin,roleController.updateRole); 
router.delete('/roles/:id',authenticateToken,isAdmin,roleController.deleteRole); 
router.delete(
    '/roles',
    authenticateToken, 
    isAdmin,           
    roleController.deletePermissionFromRole 
);
router.get('/roles',roleController.viewRoles); 
 
module.exports = router;
