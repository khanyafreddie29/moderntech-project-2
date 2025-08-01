const AttendanceModel = require('../models/attendanceModel');

// Valid attendance statuses
const VALID_STATUSES = ['Present', 'Absent', 'Late'];

const AttendanceController = {
  getAll: async (req, res) => {
    try {
      const records = await AttendanceModel.getAllAttendance();
      res.json(records);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch attendance', error: err.message });
    }
  },

  getByDate: async (req, res) => {
    const { date } = req.params;
    try {
      const records = await AttendanceModel.getAttendanceByDate(date);
      res.json(records);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch attendance for date', error: err.message });
    }
  },

  mark: async (req, res) => {
    const { employee_id, time_in, attendance_status } = req.body;

    // Validate input
    if (!employee_id || !time_in || !attendance_status) {
      return res.status(400).json({ message: 'Missing required fields: employee_id, time_in, attendance_status' });
    }

    if (!VALID_STATUSES.includes(attendance_status)) {
      return res.status(400).json({ message: `Invalid attendance status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    try {
      const isUpdate = await AttendanceModel.markAttendance(employee_id, time_in, attendance_status);
      res.json({ message: isUpdate ? 'Attendance updated successfully' : 'Attendance recorded successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to mark attendance', error: err.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { attendance_status } = req.body;

    // Validate input
    if (!attendance_status) {
      return res.status(400).json({ message: 'Missing required field: attendance_status' });
    }

    if (!VALID_STATUSES.includes(attendance_status)) {
      return res.status(400).json({ message: `Invalid attendance status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    try {
      const updated = await AttendanceModel.updateAttendance(id, attendance_status);
      if (!updated) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }
      res.json({ message: 'Attendance updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update attendance', error: err.message });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await AttendanceModel.deleteAttendance(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }
      res.json({ message: 'Attendance deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete attendance', error: err.message });
    }
  },

  getToday: async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const data = await AttendanceModel.getTodayAttendance(today);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching today\'s attendance', error: err.message });
    }
  },

  getDailySummary: async (req, res) => {
    const { date } = req.params;
    try {
      const summary = await AttendanceModel.getDailySummary(date);
      const total = summary.reduce((sum, row) => sum + row.count, 0);
      const response = {
        total,
        breakdown: {
          Present: 0,
          Absent: 0,
          Late: 0
        }
      };

      summary.forEach(row => {
        response.breakdown[row.attendance_status] = row.count;
      });

      response.percentages = {
        Present: total ? ((response.breakdown.Present / total) * 100).toFixed(2) + '%' : '0%',
        Absent: total ? ((response.breakdown.Absent / total) * 100).toFixed(2) + '%' : '0%',
        Late: total ? ((response.breakdown.Late / total) * 100).toFixed(2) + '%' : '0%'
      };

      res.json(response);
    } catch (err) {
      res.status(500).json({ message: 'Error generating summary', error: err.message });
    }
  },
};

module.exports = AttendanceController;
