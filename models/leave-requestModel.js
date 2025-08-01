const db = require('../config/db');

// find all leave requests
const LeaveRequest = {
  findAll: async (status = 'all') => {
    try {
      let query = `
        SELECT lr.id, lr.employee_id, lr.leave_type, lr.reason, lr.start_date, lr.end_date, lr.status, lr.created_at, lr.updated_at, 
               e.full_name, e.profile_image 
        FROM leave_requests lr 
        JOIN employees e ON lr.employee_id = e.id 
        WHERE lr.is_deleted = FALSE
      `;
      const params = [];
      if (status !== 'all') {
        query += ' AND lr.status = ?';
        params.push(status);
      }
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw new Error('Error fetching leave requests: ' + error.message);
    }
  },

  // create a new leave request
  create: async (data) => {
    try {
      const { employee_id, leave_type, reason, start_date, end_date, status } = data;
      const [result] = await db.query(
        `INSERT INTO leave_requests (employee_id, leave_type, reason, start_date, end_date, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [employee_id, leave_type, reason, start_date, end_date, status]
      );
      const [newRequest] = await db.query(
        `SELECT lr.id, lr.employee_id, lr.leave_type, lr.reason, lr.start_date, lr.end_date, lr.status, lr.created_at, lr.updated_at, 
                e.full_name, e.profile_image 
         FROM leave_requests lr 
         JOIN employees e ON lr.employee_id = e.id 
         WHERE lr.id = ?`,
        [result.insertId]
      );
      return newRequest[0];
    } catch (error) {
      throw new Error('Error creating leave request: ' + error.message);
    }
  },

  // update leave request status
  updateStatus: async (id, status) => {
    try {
      await db.query(
        'UPDATE leave_requests SET status = ?, updated_at = NOW() WHERE id = ? AND is_deleted = FALSE',
        [status, id]
      );
      const [updatedRequest] = await db.query(
        `SELECT lr.id, lr.employee_id, lr.leave_type, lr.reason, lr.start_date, lr.end_date, lr.status, lr.created_at, lr.updated_at, 
                e.full_name, e.profile_image 
         FROM leave_requests lr 
         JOIN employees e ON lr.employee_id = e.id 
         WHERE lr.id = ?`,
        [id]
      );
      return updatedRequest[0];
    } catch (error) {
      throw new Error('Error updating leave request status: ' + error.message);
    }
  },

  // delete a leave request
  delete: async (id) => {
    try {
      await db.query(
        'UPDATE leave_requests SET is_deleted = TRUE, updated_at = NOW() WHERE id = ?',
        [id]
      );
      return { message: 'Leave request deleted successfully' };
    } catch (error) {
      throw new Error('Error deleting leave request: ' + error.message);
    }
  },

  // find a leave request by ID
  findById: async (id) => {
    try {
      const [rows] = await db.query(
        `SELECT lr.id, lr.employee_id, lr.leave_type, lr.reason, lr.start_date, lr.end_date, lr.status, lr.created_at, lr.updated_at, 
                e.full_name, e.profile_image 
         FROM leave_requests lr 
         JOIN employees e ON lr.employee_id = e.id 
         WHERE lr.id = ? AND lr.is_deleted = FALSE`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Error fetching leave request: ' + error.message);
    }
  },

  // check if an employee has any approved leave requests
  hasApprovedLeave: async (employee_id) => {
    try {
      const [rows] = await db.query(
        `SELECT COUNT(*) as count 
         FROM leave_requests 
         WHERE employee_id = ? AND status = 'Approved' AND is_deleted = FALSE`,
        [employee_id]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw new Error('Error checking approved leaves: ' + error.message);
    }
  }
};

module.exports = LeaveRequest;