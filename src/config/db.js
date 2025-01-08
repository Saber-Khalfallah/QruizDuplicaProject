const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST, // Render DB host
  port: process.env.DB_PORT, // Render DB port
  user: process.env.DB_USER, // Render DB username
  password: process.env.DB_PASSWORD, // Render DB password
  database: process.env.DB_NAME, // Render DB name
  ssl: true, // Use this if Render enforces SSL with default configurations

});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
