const pool = require('../config/db');
const bcrypt = require('bcrypt');

const findUserByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND is_deleted = FALSE', [username]);
  return rows[0];
};

module.exports = {
  findUserByUsername
  
};
