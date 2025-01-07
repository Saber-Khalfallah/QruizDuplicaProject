const redisClient = require('./redis');

(async () => {
    try {
        await redisClient.set('test_key', 'test_value');
        const value = await redisClient.get('test_key');
        console.log('Test Key Value:', value); // Should log 'test_value'
    } catch (err) {
        console.error('Test Redis Error:', err);
    } finally {
        await redisClient.quit();
    }
})();
