const db = require("../config/db");
const { generateId } = require("../utils/id");

async function createPost(userId, contentText, mediaUrl, mediaType) {
  const id = generateId();

  await db.query(
    `INSERT INTO posts (id, user_id, content_text, media_url, media_type)
     VALUES (?, ?, ?, ?, ?)`,
    [id, userId, contentText, mediaUrl, mediaType]
  );

  return id;
}

async function findById(postId) {
  const [rows] = await db.query(
    `SELECT p.*, u.name AS user_name, u.id AS user_id
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = ? LIMIT 1`,
    [postId]
  );
  return rows[0] || null;
}

async function getTodayPostCount(userId) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS count
     FROM posts
     WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
    [userId]
  );
  return rows[0].count;
}

async function getAllPosts() {
  const [rows] = await db.query(
    `SELECT p.id, p.content_text, p.media_url, p.media_type, p.created_at,
            u.id AS user_id, u.name AS user_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC`
  );
  return rows;
}

async function getPostsWithMeta() {
  const [posts] = await db.query(
    `SELECT p.id, p.content_text, p.media_url, p.media_type, p.created_at,
            u.id AS user_id, u.name AS user_name,
            (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC`
  );
  return posts;
}

async function deleteById(id) {
  const [r] = await db.query("DELETE FROM posts WHERE id = ?", [id]);
  return r.affectedRows;
}

module.exports = {
  createPost,
  getTodayPostCount,
  getAllPosts,
  getPostsWithMeta,
  findById,
  deleteById,
};
