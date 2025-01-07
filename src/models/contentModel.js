const pool = require('../config/db');

// Get all content
const getAllContent = async () => {
  const result = await pool.query('SELECT * FROM content');
  return result.rows;
};

// Create content
const createContent = async (title, description, type) => {
  const result = await pool.query(
    'INSERT INTO content (title, description, type) VALUES ($1, $2, $3) RETURNING *',
    [title, description, type]
  );
  return result.rows[0];
};

module.exports = { getAllContent, createContent };
