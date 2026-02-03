const db = require("../config/db");
const { generateId } = require("../utils/id");

async function addShare(postId, userId) {
  const id = generateId();

  await db.query(
    `INSERT INTO shares (id, post_id, user_id)
     VALUES (?, ?, ?)`,
    [id, postId, userId]
  );

  return id;
}

async function addSharedPostForUser(originalPostId, sharedByUserId, ownerUserId) {
  const id = generateId();

  await db.query(
    `INSERT INTO shared_posts (id, original_post_id, shared_by, owner_user_id)
     VALUES (?, ?, ?, ?)`,
    [id, originalPostId, sharedByUserId, ownerUserId]
  );

  return id;
}

async function getShareCount(postId) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM shares WHERE post_id = ?",
    [postId]
  );
  return rows[0]?.count || 0;
}

module.exports = {
  addShare,
  addSharedPostForUser,
  getShareCount,
};
