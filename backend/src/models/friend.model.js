const db = require("../config/db");
const { generateId } = require("../utils/id");

/**
 * Send friend request
 */
async function sendRequest(fromUserId, toUserId) {
  // Check if already friends
  const [existingFriend] = await db.query(
    `SELECT 1 FROM friendships
     WHERE (user1_id = ? AND user2_id = ?)
        OR (user1_id = ? AND user2_id = ?)`,
    [fromUserId, toUserId, toUserId, fromUserId]
  );
  if (existingFriend.length > 0) {
    throw new Error("You are already friends");
  }

  // Check if request already exists
  const [existingReq] = await db.query(
    `SELECT 1 FROM friend_requests
     WHERE from_user_id = ? AND to_user_id = ? AND status = 'pending'`,
    [fromUserId, toUserId]
  );
  if (existingReq.length > 0) {
    throw new Error("Friend request already sent");
  }

  const id = generateId();

  await db.query(
    `INSERT INTO friend_requests (id, from_user_id, to_user_id, status)
     VALUES (?, ?, ?, 'pending')`,
    [id, fromUserId, toUserId]
  );

  return id;
}

/**
 * Get incoming friend requests
 */
async function getIncomingRequests(userId) {
  const [rows] = await db.query(
    `SELECT fr.id, u.id AS from_user_id, u.name, u.email
     FROM friend_requests fr
     JOIN users u ON fr.from_user_id = u.id
     WHERE fr.to_user_id = ? AND fr.status = 'pending'`,
    [userId]
  );
  return rows;
}

/**
 * Accept friend request
 */
async function acceptRequest(requestId, userId) {
  const [rows] = await db.query(
    `SELECT * FROM friend_requests
     WHERE id = ? AND to_user_id = ? AND status = 'pending'`,
    [requestId, userId]
  );

  const req = rows[0];
  if (!req) throw new Error("Request not found");

  // Mark as accepted
  await db.query(
    `UPDATE friend_requests SET status = 'accepted' WHERE id = ?`,
    [requestId]
  );

  // Create friendship
  const u1 = Math.min(req.from_user_id, req.to_user_id);
  const u2 = Math.max(req.from_user_id, req.to_user_id);

  await db.query(
    `INSERT IGNORE INTO friendships (id, user1_id, user2_id)
     VALUES (?, ?, ?)`,
    [generateId(), u1, u2]
  );
}

/**
 * Get friends list
 */
async function getFriends(userId) {
  const [rows] = await db.query(
    `SELECT u.id, u.name, u.email
     FROM friendships f
     JOIN users u
       ON u.id = IF(f.user1_id = ?, f.user2_id, f.user1_id)
     WHERE f.user1_id = ? OR f.user2_id = ?`,
    [userId, userId, userId]
  );
  return rows;
}

/**
 * Get friend count
 */
async function getFriendCount(userId) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS count
     FROM friendships
     WHERE user1_id = ? OR user2_id = ?`,
    [userId, userId]
  );
  return rows[0].count;
}

/**
 * Get friend IDs
 */
async function getFriendIds(userId) {
  const [rows] = await db.query(
    `SELECT user1_id AS friend_id FROM friendships WHERE user2_id = ?
     UNION
     SELECT user2_id AS friend_id FROM friendships WHERE user1_id = ?`,
    [userId, userId]
  );
  return rows.map(r => r.friend_id);
}

/**
 * Remove friend
 */
async function removeFriend(userA, userB) {
  const [result] = await db.query(
    `DELETE FROM friendships
     WHERE (user1_id = ? AND user2_id = ?)
        OR (user1_id = ? AND user2_id = ?)`,
    [userA, userB, userB, userA]
  );

  if (result.affectedRows === 0) {
    throw new Error("Friendship not found");
  }
}

module.exports = {
  sendRequest,
  getIncomingRequests,
  acceptRequest,
  getFriends,
  getFriendCount,
  getFriendIds,
  removeFriend,
};
