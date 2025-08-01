const db = require('../config/db');

// get all attendance records
const AttendanceModel = {
  getAllAttendance: async () => {
    const [rows] = await db.query(`
      SELECT a.id, e.full_name, e.position, e.department, a.time_in, a.attendance_status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.is_deleted = FALSE
      ORDER BY a.time_in DESC
    `);
    return rows;
  },

  // get attendance by date
  getAttendanceByDate: async (date) => {
    const [rows] = await db.query(`
      SELECT a.id, e.full_name, e.position, e.department, a.attendance_status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.time_in = ? AND a.is_deleted = FALSE
    `, [date]);
    return rows;
  },

  // get attendance by employee ID
  markAttendance: async (employeeId, date, status) => {
    const [existing] = await db.query(`
      SELECT id FROM attendance WHERE employee_id = ? AND time_in = ? AND is_deleted = FALSE
    `, [employeeId, date]);

    if (existing.length > 0) {
      // Update existing
      await db.query(`
        UPDATE attendance SET attendance_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = ? AND time_in = ?
      `, [status, employeeId, date]);
      return true; // Indicates an update
    } else {
      // Insert new
      await db.query(`
        INSERT INTO attendance (employee_id, time_in, attendance_status)
        VALUES (?, ?, ?)
      `, [employeeId, date, status]);
      return false; // Indicates a new record
    }
  },

  updateAttendance: async (id, status) => {
    const [result] = await db.query(`
      UPDATE attendance SET attendance_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_deleted = FALSE
    `, [status, id]);
    return result.affectedRows > 0;
  },

  deleteAttendance: async (id) => {
    const [result] = await db.query(`
      UPDATE attendance SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = FALSE
    `, [id]);
    return result.affectedRows > 0;
  },

  // get today's attendance
  getTodayAttendance: async (date) => {
    const [rows] = await db.query(`
      SELECT
        e.id AS employee_id,
        e.full_name,
        e.position,
        e.department,
        e.profile_image,
        a.attendance_status,
        a.time_in
      FROM employees e
      LEFT JOIN attendance a
        ON e.id = a.employee_id AND a.time_in = ?
      WHERE e.is_deleted = FALSE
    `, [date]);
    return rows;
  },

  // get attendance summary for a specific date
  getDailySummary: async (date) => {
    const [rows] = await db.query(`
      SELECT attendance_status, COUNT(*) AS count
      FROM attendance
      WHERE time_in = ? AND is_deleted = FALSE
      GROUP BY attendance_status
    `, [date]);
    return rows;
  },
};

module.exports = AttendanceModel;
