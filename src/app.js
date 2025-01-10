const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dashboardRoutes = require('./routes/dashboardRoutes');
const linkRoutes = require('./routes/linkRoutes');
const linkAccessRoutes = require('./routes/linkAccessRoutes');
const participantRoutes = require('./routes/participantRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const contentAnalyticsRoutes = require('./routes/contentAnalyticsRoutes');
const pool = require('./config/db'); // Adjust the path to match your project structure




require('dotenv').config();

const authRoutes = require('./routes/authRoutes'); // Import the router
const contentRoutes = require('./routes/contentRoutes');
const userRoutes = require('./routes/userRoutes');
const contentElementsRoutes= require('./routes/contentElementsRoutes');

const app = express();
app.use(express.json());

const PORT = process.env.DB_PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use('/api/auth', authRoutes); // Correct: Pass the router object
console.log('Auth Routes',authRoutes); // Add this before the `app.use` call
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/links', linkRoutes);
app.use('/content', linkAccessRoutes);
app.use('/api/content-elements', contentElementsRoutes); 
app.use('/api/participate', participantRoutes);
app.use('/api/content-analytics', contentAnalyticsRoutes);
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (error) {
    console.error('Database connection error:', error.stack );
    console.log('db url : ',process.env.DATABASE_URL);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USER, process.env.DB_NAME);

});
const errorHandler = require('./middleware/errorHandler');

// Global Error Handler
app.use(errorHandler);
//api documentation using swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
console.log('API Documentation available at http://localhost:3000/api-docs');