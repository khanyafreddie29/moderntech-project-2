const model = require('../models/performance-reviewModel');

const getAllReviews = async (req, res) => {
  try {
    const reviews = await model.getAllReviews();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await model.getAllEmployees();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

const createReview = async (req, res) => {
  try {
    const requiredFields = ['employee_id', 'review_date', 'reviewer', 'rating', 'status', 'category'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    const review = await model.createReview(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

const updateReview = async (req, res) => {
  try {
    const requiredFields = ['employee_id', 'review_date', 'reviewer', 'rating', 'status', 'category'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    const review = await model.updateReview(req.params.id, req.body);
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { full_name, department, position, profile_image, salary, employment_history, email, phone_number } = req.body;
    if (!full_name) return res.status(400).json({ error: 'Full name is required' });

    const employee = await model.createEmployee(
      full_name,
      department || 'Unassigned',
      position || 'Unassigned',
      profile_image || '',
      salary || 0.00,
      employment_history || '',
      email || '',
      phone_number || ''
    );
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

const deleteReview = async (req, res) => {
  try {
    await model.deleteReview(req.params.id);
    res.json({ message: 'Review soft-deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

module.exports = {
  getAllReviews,
  getAllEmployees,
  createReview,
  updateReview,
  createEmployee,
  deleteReview
};