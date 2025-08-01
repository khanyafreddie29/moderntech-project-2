const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

// Create a pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Bheka10@',
  database: process.env.DB_NAME || 'hr_staff_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
  
});

// Test connection using pool
pool.getConnection().then(connection => {
  console.log('Connected to MySQL Database');
  connection.release();
}).catch(err => {
  console.error('Failed to connect to MySQL:', err.message);
});

module.exports = pool; // Export the pool directly