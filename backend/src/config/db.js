const mysql = require("mysql2");

const pool = mysql.createPool(process.env.DATABASE_URL + "?ssl=true", {
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 20000,
}).promise();

pool.getConnection()
  .then(conn => {
    console.log("✅ Database connected successfully");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });

module.exports = pool;
