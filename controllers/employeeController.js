const Employee = require('../models/employeeModel');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.getAll();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.getById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  const {
    full_name,
    position,
    department,
    salary,
    employment_history,
    email,
    phone_number,
    profile_image,
    status
  } = req.body;

  if (!full_name || !position || !department || !salary || !email || !phone_number) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (isNaN(salary) || salary < 0) {
    return res.status(400).json({ error: 'Invalid salary value' });
  }

  try {
    const result = await Employee.create({
      full_name,
      position,
      department,
      salary: parseFloat(salary),
      employment_history,
      email,
      phone_number,
      profile_image,
      status
    });

    res.status(201).json({ message: 'Employee created', id: result.insertId });
  } catch (err) {
    if (err.message.includes('Email already exists')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  const {
    full_name,
    position,
    department,
    salary,
    employment_history,
    email,
    phone_number,
    profile_image,
    status
  } = req.body;

  if (!full_name || !position || !department || !salary || !email || !phone_number) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (isNaN(salary) || salary < 0) {
    return res.status(400).json({ error: 'Invalid salary value' });
  }

  try {
    const result = await Employee.update(req.params.id, {
      full_name,
      position,
      department,
      salary: parseFloat(salary),
      employment_history,
      email,
      phone_number,
      profile_image,
      status
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee updated', affectedRows: result.affectedRows });
  } catch (err) {
    if (err.message.includes('Email already exists')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const result = await Employee.softDelete(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted', affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};