const pool = require('../config/db');

// Fetch all payroll entries with employee details
async function getAllPayrolls() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.employee_id,
        e.full_name AS name,
        e.department,
        p.basic_salary AS salary,
        p.hours_worked,
        p.leave_days,
        p.total_deductions AS deductions,
        p.net_salary AS final_salary
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.is_deleted = FALSE
    `);
    return rows;
  } catch (error) {
    throw new Error(`Error fetching payrolls: ${error.message}`);
  }
}

// Fetch a single payroll entry by ID
async function getPayrollById(id) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.employee_id,
        e.full_name AS name,
        e.department,
        p.basic_salary AS salary,
        p.hours_worked,
        p.leave_days,
        p.tax,
        p.uif,
        p.leave_penalty,
        p.total_deductions AS deductions,
        p.net_salary AS final_salary,
        p.pay_period_start,
        p.pay_period_end
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = ? AND p.is_deleted = FALSE
    `, [id]);
    return rows[0];
  } catch (error) {
    throw new Error(`Error fetching payroll: ${error.message}`);
  }
}

// Fetch payroll entries by employee name (for search functionality)
async function getPayrollsByName(name) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.employee_id,
        e.full_name AS name,
        e.department,
        p.basic_salary AS salary,
        p.hours_worked,
        p.leave_days,
        p.total_deductions AS deductions,
        p.net_salary AS final_salary
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.is_deleted = FALSE AND e.full_name LIKE ?
    `, [`%${name}%`]);
    return rows;
  } catch (error) {
    throw new Error(`Error searching payrolls: ${error.message}`);
  }
}

// Fetch all employees for dropdown
async function getEmployeesForDropdown() {
  try {
    const [rows] = await pool.query(`
      SELECT id, full_name AS name, department, salary
      FROM employees
      WHERE is_deleted = FALSE
    `);
    return rows;
  } catch (error) {
    throw new Error(`Error fetching employees: ${error.message}`);
  }
}

// Add a new payroll entry
async function addPayroll(payrollData) {
  const {
    employee_id,
    basic_salary,
    hours_worked,
    leave_days,
    tax,
    uif,
    leave_penalty,
    total_deductions,
    net_salary,
    pay_period_start,
    pay_period_end
  } = payrollData;

  try {
    const [result] = await pool.query(`
      INSERT INTO payroll (
        employee_id, pay_period_start, pay_period_end, basic_salary, hours_worked, 
        leave_days, tax, uif, leave_penalty, total_deductions, net_salary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      employee_id, pay_period_start, pay_period_end, basic_salary, hours_worked,
      leave_days, tax, uif, leave_penalty, total_deductions, net_salary
    ]);
    return { id: result.insertId, ...payrollData };
  } catch (error) {
    throw new Error(`Error adding payroll: ${error.message}`);
  }
}

// Update payroll and include basic_salary
async function updatePayroll(data) {
  const {
    id,
    hours_worked,
    leave_days,
    salary, 
    tax,
    uif,
    leave_penalty,
    total_deductions,
    net_salary
  } = data;

  try {
    const [result] = await pool.query(`
      UPDATE payroll SET 
        hours_worked = ?, 
        leave_days = ?, 
        basic_salary = ?, 
        tax = ?, 
        uif = ?, 
        leave_penalty = ?, 
        total_deductions = ?, 
        net_salary = ?, 
        updated_at = NOW()
      WHERE id = ? AND is_deleted = FALSE
    `, [
      hours_worked,
      leave_days,
      salary,
      tax,
      uif,
      leave_penalty,
      total_deductions,
      net_salary,
      id
    ]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error updating payroll: ${error.message}`);
  }
}

// Delete a payroll entry
async function deletePayroll(id) {
  try {
    const [result] = await pool.query(`
      UPDATE payroll SET is_deleted = TRUE WHERE id = ?
    `, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error deleting payroll: ${error.message}`);
  }
}

// Fetch payroll details for payslip generation
async function getPayrollForPayslip(id) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.employee_id,
        e.full_name AS name,
        e.department,
        p.basic_salary AS salary,
        p.hours_worked,
        p.leave_days,
        p.tax,
        p.uif,
        p.leave_penalty,
        p.total_deductions AS deductions,
        p.net_salary AS final_salary,
        p.pay_period_start,
        p.pay_period_end
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = ? AND p.is_deleted = FALSE
    `, [id]);
    return rows[0];
  } catch (error) {
    throw new Error(`Error fetching payslip data: ${error.message}`);
  }
}

module.exports = {
  getAllPayrolls,
  getPayrollById,
  getPayrollsByName,
  getEmployeesForDropdown,
  addPayroll,
  updatePayroll,
  deletePayroll,
  getPayrollForPayslip
};
