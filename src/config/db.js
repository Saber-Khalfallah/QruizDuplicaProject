const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST ,
  port: process.env.DB_PORT,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME,
  ssl: {
      rejectUnauthorized: false, // Required for Render DB
    },
});

pool.on('connect', () => {
  console.log('Connected to the database');
  console.log('DB Host',process.env.DB_HOST);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
