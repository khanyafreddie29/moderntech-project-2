const db = require('../config/db');

// get all employees
const Employee = {
  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM employees WHERE is_deleted = FALSE');
      return rows;
    } catch (error) {
      throw new Error('Error fetching employees: ' + error.message);
    }
  },

  // get employee by ID
  getById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM employees WHERE id = ? AND is_deleted = FALSE', [id]);
      return rows[0];
    } catch (error) {
      throw new Error('Error fetching employee: ' + error.message);
    }
  },

  // create a new employee
  create: async (emp) => {
    try {
      const [result] = await db.query(
        `INSERT INTO employees 
          (full_name, position, department, salary, employment_history, email, phone_number, profile_image, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          emp.full_name,
          emp.position,
          emp.department,
          emp.salary,
          emp.employment_history,
          emp.email,
          emp.phone_number,
          emp.profile_image,
          emp.status || 'Active'
        ]
      );
      return result;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw new Error('Error creating employee: ' + error.message);
    }
  },

  // update an existing employee
  update: async (id, emp) => {
    try {
      const [result] = await db.query(
        `UPDATE employees SET 
           full_name = ?,
           position = ?,
           department = ?,
           salary = ?,
           employment_history = ?,
           email = ?,
           phone_number = ?,
           profile_image = ?,
           status = ?
         WHERE id = ? AND is_deleted = FALSE`,
        [
          emp.full_name,
          emp.position,
          emp.department,
          emp.salary,
          emp.employment_history,
          emp.email,
          emp.phone_number,
          emp.profile_image,
          emp.status || 'Active',
          id
        ]
      );
      return result;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw new Error('Error updating employee: ' + error.message);
    }
  },

  
  softDelete: async (id) => {
    try {
      const [result] = await db.query(
        `UPDATE employees SET is_deleted = TRUE WHERE id = ?`,
        [id]
      );
      return result;
    } catch (error) {
      throw new Error('Error deleting employee: ' + error.message);
    }
  },

  // update employee status
  updateStatus: async (id, status) => {
    try {
      const [result] = await db.query(
        `UPDATE employees SET status = ?, updated_at = NOW() WHERE id = ? AND is_deleted = FALSE`,
        [status, id]
      );
      return result;
    } catch (error) {
      throw new Error('Error updating employee status: ' + error.message);
    }
  }
};

module.exports = Employee;