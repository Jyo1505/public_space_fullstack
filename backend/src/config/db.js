const mysql = require("mysql2");

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT
} = require("./config");

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
  ssl: {
    rejectUnauthorized: false
  },
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 5,
}).promise();

module.exports = pool;


pool.getConnection()
  .then(conn => {
    console.log("✅ Database connected successfully");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });
