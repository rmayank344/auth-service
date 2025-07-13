const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

const connectRedis = async () => {
  await redisClient.connect();
};

module.exports = {redisClient, connectRedis}; 