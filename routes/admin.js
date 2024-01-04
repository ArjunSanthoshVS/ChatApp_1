const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.post('/sendLink', adminController.sendLink);
router.get('/activeChats', adminController.activeChats);
router.get('/archivedChats', adminController.archivedChats);
router.put('/userLeave', adminController.userLeave);

module.exports = router;
