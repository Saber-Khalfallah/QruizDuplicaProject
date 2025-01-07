const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Register User
const registerUser = async (username, email, password) => {
  try {
      const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const result = await pool.query(
          'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
          [username, email, hashedPassword, 'registered']
      );

      // Exclude sensitive data
      const { password_hash, ...safeUserData } = result.rows[0];
      return safeUserData;
  } catch (err) {
      console.error('Error in registerUser model:', err.message);
      throw new Error('Database error during registration');
  }
};


// Login User
const loginUser = async (email) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        return result.rows[0];
    } catch (err) {
        console.error('Error in loginUser model:', err.message);
        throw new Error('Database error during login');
    }
};
// Update reset token and expiration
const updateResetToken = async (userId, token, expires) => {
  await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE user_id = $3',
      [token, expires, userId]
  );
};
// Get user by email
const getUserByEmail = async (email) => {
  const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
  );
  return result.rows[0];
};
// Get user by reset token
const getUserByResetToken = async (token) => {
  const result = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = $1',
      [token]
  );
  return result.rows[0];
};
// Reset user password
const resetUserPassword = async (userId, hashedPassword) => {
  await pool.query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE user_id = $2',
      [hashedPassword, userId]
  );
};
module.exports = { registerUser, loginUser, updateResetToken, getUserByEmail, getUserByResetToken, resetUserPassword };
