const { createClient } = require('redis');

// Redis client for local installation
const redisClient = createClient({
    socket: {
        host: '127.0.0.1', // Default localhost
        port: 6379,        // Default Redis port
    },
});

// Handle Redis client errors
redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis locally');
    } catch (err) {
        console.error('Error connecting to local Redis:', err);
    }
})();

module.exports = redisClient;
