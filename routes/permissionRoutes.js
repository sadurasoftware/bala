const express = require('express');
const permissionController = require('../controllers/permissionController');

const router = express.Router();

router.post('/permissions',permissionController. createPermission);
router.get('/permissions',permissionController.viewPermissions);
module.exports = router;
