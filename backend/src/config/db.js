const mysql = require("mysql2");

// Create pool using DATABASE_URL
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,

  // ✅ mysql2 REQUIRES ssl to be an object
  ssl: {
    rejectUnauthorized: false,
  },

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 20000,
}).promise();

// 🔍 Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log("✅ Database connected successfully");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });

module.exports = pool;
