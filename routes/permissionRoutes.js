const express = require('express');
const permissionController = require('../controllers/permissionController');

const router = express.Router();

router.post('/permissions',permissionController. createPermission);
router.get('/permissions',permissionController.viewPermissions);
router.put('/permissions/:id',permissionController.updatePermission);
router.delete('/permissions/:id',permissionController.deletePermission)
module.exports = router;
