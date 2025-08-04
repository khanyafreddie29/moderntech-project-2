const bcrypt = require('bcrypt');
const pool = require('../config/db');

const updateUserPassword = async () => {
  const username = 'sibongile_n';
  const plainPassword = 'sibongile123'; 
  const saltRounds = 10;

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    await pool.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username]);
    console.log(`Password for ${username} updated successfully.`);
  } catch (error) {
    console.error('Error updating password:', error.message);
  } finally {
    pool.end();
  }
};

updateUserPassword();