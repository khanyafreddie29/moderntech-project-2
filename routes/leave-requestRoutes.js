const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/leave-requestController');

router.get('/', leaveRequestController.getAllLeaveRequests);
router.post('/', leaveRequestController.createLeaveRequest);
router.put('/:id/status', leaveRequestController.updateLeaveRequestStatus);
router.delete('/:id', leaveRequestController.deleteLeaveRequest);

module.exports = router;