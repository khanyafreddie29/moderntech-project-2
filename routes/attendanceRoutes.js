const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');

router.get('/', AttendanceController.getAll);
router.get('/today', AttendanceController.getToday);
router.get('/date/:date', AttendanceController.getByDate);
router.get('/summary/:date', AttendanceController.getDailySummary);
router.post('/', AttendanceController.mark);
router.put('/:id', AttendanceController.update);
router.delete('/:id', AttendanceController.delete);

module.exports = router;