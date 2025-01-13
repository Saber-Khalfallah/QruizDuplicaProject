const { createClient } = require('redis');

// Redis client for Render Redis Cloud
const redisClient = createClient({
    url: process.env.REDIS_URL, // Use REDIS_URL from environment variables
});

// Handle Redis client errors
redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis on Render');
    } catch (err) {
        console.error('Error connecting to Redis:', err);
    }
})();

module.exports = redisClient;
