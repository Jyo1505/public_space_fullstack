const db = require("../config/db");

async function findByEmail(email) {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
}
async function findById(id) {
  const [rows] = await db.query("SELECT id, name, email, created_at FROM users WHERE id = ?", [id]);
  return rows[0];
}
async function findByName(name) {
  const [rows] = await db.query("SELECT * FROM users WHERE name = ? LIMIT 1", [name]);
  return rows[0];
}
// partial name search (case-insensitive)
async function searchByName(q) {
  const [rows] = await db.query(
    "SELECT id, name, email FROM users WHERE name LIKE ? LIMIT 50",
    [`%${q}%`]
  );
  return rows;
}
async function createUser(name, email, passwordHash) {
  const [result] = await db.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );
  return {
    id: result.insertId,
    name,
    email,
  };
}

// return all other users (exclude current)
async function getAllOtherUsers(excludeUserId) {
  // get friend ids first
  const [friendRows] = await db.query(
    `SELECT user1_id AS friend_id FROM friendships WHERE user2_id = ?
     UNION
     SELECT user2_id AS friend_id FROM friendships WHERE user1_id = ?`,
    [excludeUserId, excludeUserId]
  );
  const friendIds = friendRows.map(r => r.friend_id);

  // build parameter list for exclusion
  // always exclude current user
  let placeholders = "?,";
  const params = [excludeUserId];

  if (friendIds.length > 0) {
    placeholders += friendIds.map(() => "?").join(",");
    params.push(...friendIds);
  } else {
    // remove trailing comma if no friendIds
    placeholders = "?";
  }

  const sql = `SELECT id, name, email FROM users WHERE id NOT IN (${placeholders}) ORDER BY name LIMIT 100`;
  const [rows] = await db.query(sql, params);
  return rows;
}


module.exports = {
  findByEmail,
  findByName,
  createUser,
  findById,
  findByName,
  searchByName,
  getAllOtherUsers,
};
