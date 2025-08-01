const payrollModel = require('../models/payrollModel');

// Get all payroll entries
async function getPayrolls(req, res) {
  try {
    const payrolls = await payrollModel.getAllPayrolls();
    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get a single payroll entry by ID
async function getPayrollById(req, res) {
  try {
    const { id } = req.params;
    const payroll = await payrollModel.getPayrollById(id);
    if (!payroll) {
      return res.status(404).json({ error: 'Payroll entry not found' });
    }
    res.status(200).json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Search payrolls by employee name
async function searchPayrolls(req, res) {
  try {
    const { name } = req.query;
    const payrolls = await payrollModel.getPayrollsByName(name || '');
    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get employees for dropdown
async function getEmployees(req, res) {
  try {
    const employees = await payrollModel.getEmployeesForDropdown();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Add a new payroll entry
async function addPayroll(req, res) {
  try {
    const { employee_id, hours_worked, leave_days, salary } = req.body;

    if (!employee_id || hours_worked === undefined || leave_days === undefined || salary === undefined) {
      return res.status(400).json({ error: 'Missing required fields: employee_id, hours_worked, leave_days, salary' });
    }

    const parsedHours = parseInt(hours_worked);
    const parsedLeaveDays = parseInt(leave_days);
    const parsedSalary = parseFloat(salary);

    if (isNaN(parsedHours) || isNaN(parsedLeaveDays) || isNaN(parsedSalary)) {
      return res.status(400).json({ error: 'hours_worked, leave_days and salary must be valid numbers' });
    }

    if (parsedSalary <= 0) {
      return res.status(400).json({ error: 'Invalid salary' });
    }

    const employees = await payrollModel.getEmployeesForDropdown();
    const emp = employees.find(e => e.id == employee_id);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const tax = Math.round(parsedSalary * 0.18);
    const uif = Math.round(parsedSalary * 0.01);
    const leave_penalty = Math.round((parsedSalary / 22) * parsedLeaveDays);
    const total_deductions = tax + uif + leave_penalty;
    const net_salary = parsedSalary - total_deductions;

    const payrollData = {
      employee_id,
      basic_salary: parsedSalary,
      hours_worked: parsedHours,
      leave_days: parsedLeaveDays,
      tax,
      uif,
      leave_penalty,
      total_deductions,
      net_salary,
      pay_period_start: new Date('2025-07-01'),
      pay_period_end: new Date('2025-07-31')
    };

    const result = await payrollModel.addPayroll(payrollData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Add payroll error:', error);
    res.status(500).json({ error: `Error adding payroll: ${error.message}` });
  }
}

// Update an existing payroll entry
async function updatePayroll(req, res) {
  try {
    const { id } = req.params;
    const { hours_worked, leave_days, salary } = req.body;

    if (hours_worked === undefined || leave_days === undefined || salary === undefined) {
      return res.status(400).json({ error: 'Missing required fields: hours_worked, leave_days, salary' });
    }

    const parsedHours = parseInt(hours_worked);
    const parsedLeaveDays = parseInt(leave_days);
    const parsedSalary = parseFloat(salary);

    if (isNaN(parsedHours) || isNaN(parsedLeaveDays) || isNaN(parsedSalary)) {
      return res.status(400).json({ error: 'hours_worked, leave_days, salary must be valid numbers' });
    }

    if (parsedSalary <= 0) {
      return res.status(400).json({ error: 'Invalid salary value' });
    }

    const payroll = await payrollModel.getPayrollById(id);
    if (!payroll) {
      return res.status(404).json({ error: 'Payroll entry not found' });
    }

    const tax = Math.round(parsedSalary * 0.18);
    const uif = Math.round(parsedSalary * 0.01);
    const leave_penalty = Math.round((parsedSalary / 22) * parsedLeaveDays);
    const total_deductions = tax + uif + leave_penalty;
    const net_salary = parsedSalary - total_deductions;

    const payrollData = {
      id,
      hours_worked: parsedHours,
      leave_days: parsedLeaveDays,
      salary: parsedSalary,
      tax,
      uif,
      leave_penalty,
      total_deductions,
      net_salary
    };

    const success = await payrollModel.updatePayroll(payrollData);
    if (!success) {
      return res.status(500).json({ error: 'Failed to update payroll' });
    }

    res.status(200).json({ message: 'Payroll updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete a payroll entry
async function deletePayroll(req, res) {
  try {
    const { id } = req.params;
    const success = await payrollModel.deletePayroll(id);
    if (!success) {
      return res.status(404).json({ error: 'Payroll entry not found' });
    }
    res.status(200).json({ message: 'Payroll entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Generate payslip data
async function generatePayslip(req, res) {
  try {
    const { id } = req.params;
    const payroll = await payrollModel.getPayrollForPayslip(id);
    if (!payroll) {
      return res.status(404).json({ error: 'Payroll entry not found' });
    }
    res.status(200).json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPayrolls,
  getPayrollById,
  searchPayrolls,
  getEmployees,
  addPayroll,
  updatePayroll,
  deletePayroll,
  generatePayslip
};
