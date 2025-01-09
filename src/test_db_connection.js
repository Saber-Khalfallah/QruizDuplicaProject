require('dotenv').config();
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

console.log('Database connection details:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);

const testQuery = async () => {
    try {
        const result = await pool.query('SELECT * FROM "users" LIMIT 1;'); // Explicitly specify schema
        console.log('Query succeeded:', result.rows);
    } catch (err) {
        console.error('Query failed:');
        console.error('Error message:', err.message);
        console.error('Stack trace:', err.stack);
    } finally {
        pool.end();
    }
};

testQuery();
