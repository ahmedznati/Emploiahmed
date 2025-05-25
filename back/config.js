// Node.js config (replaces config.py)
module.exports = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ahmed',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
};
