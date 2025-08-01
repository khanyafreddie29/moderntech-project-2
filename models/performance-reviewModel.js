const pool = require('../config/db');

// Fetch all reviews 
async function getAllReviews() {
  const [rows] = await pool.query(`
    SELECT 
      r.*, 
      e.full_name,
      e.profile_image,
      e.position,
      e.department
    FROM performance_reviews r
    JOIN employees e ON r.employee_id = e.id
    WHERE r.is_deleted = FALSE
    ORDER BY r.review_date DESC
  `);
  return rows;
}

// Create a new review
async function createReview(data) {
  const {
    employee_id,
    review_date,
    reviewer,
    comments,
    rating,
    category,
    status
  } = data;

  const [result] = await pool.query(
    `INSERT INTO performance_reviews 
    (employee_id, review_date, reviewer, comments, rating, category, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [employee_id, review_date, reviewer, comments, rating, category, status]
  );

  return { id: result.insertId, ...data };
}

// Update a review
async function updateReview(id, data) {
  const {
    employee_id,
    review_date,
    reviewer,
    comments,
    rating,
    category,
    status
  } = data;

  await pool.query(
    `UPDATE performance_reviews 
     SET employee_id = ?, review_date = ?, reviewer = ?, comments = ?, rating = ?, category = ?, status = ?
     WHERE id = ? AND is_deleted = FALSE`,
    [employee_id, review_date, reviewer, comments, rating, category, status, id]
  );

  return { id, ...data };
}

// Soft delete a review
async function deleteReview(id) {
  await pool.query(`UPDATE performance_reviews SET is_deleted = TRUE WHERE id = ?`, [id]);
}

// Get all employees
async function getAllEmployees() {
  const [rows] = await pool.query(`SELECT * FROM employees WHERE is_deleted = FALSE`);
  return rows;
}

// Create new employee
async function createEmployee(full_name, department, position, profile_image, salary, employment_history, email, phone_number) {
  const [result] = await pool.query(
    `INSERT INTO employees (full_name, department, position, profile_image, salary, employment_history, email, phone_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [full_name, department, position, profile_image, salary, employment_history, email, phone_number]
  );
  return { id: result.insertId, full_name, department, position, profile_image, salary, employment_history, email, phone_number };
}

module.exports = {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllEmployees,
  createEmployee
};