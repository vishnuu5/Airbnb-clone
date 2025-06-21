module.exports = {
  development: {
    port: process.env.PORT || 5000,
    mongoUri:
      process.env.MONGODB_URI || "mongodb://localhost:27017/stayfinder_dev",
    jwtSecret: process.env.JWT_SECRET || "your-secret-key",
    jwtExpire: process.env.JWT_EXPIRE || "30d",
    nodeEnv: "development",
  },
  production: {
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE,
    nodeEnv: "production",
  },
};
