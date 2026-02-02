const Friend = require("../models/friend.model");
const User = require("../models/user.model");

// POST /api/friends/request  { email }
// POST /api/friends/request { name }
exports.sendRequest = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Friend name is required" });
    }

    // Find user by exact name OR partial match (first match)
    // If you added findByName to user.model: use that, otherwise query DB directly
    const User = require("../models/user.model");

    // try exact match first
    let toUser = await User.findByName(name);

    // if not found, try partial match (first one)
    if (!toUser) {
      const db = require("../config/db");
      const [rows] = await db.query(
        "SELECT * FROM users WHERE name LIKE ? LIMIT 1",
        [`%${name}%`]
      );
      toUser = rows[0];
    }

    if (!toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (toUser.id === fromUserId) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    await Friend.sendRequest(fromUserId, toUser.id);

    res.json({ message: "Friend request sent", to_user: { id: toUser.id, name: toUser.name, email: toUser.email } });
  } catch (err) {
    console.error("sendRequest error:", err.message || err);
    res.status(400).json({ message: err.message || "Error sending request" });
  }
};


exports.getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await Friend.getIncomingRequests(userId);
    res.json({ requests });
  } catch (err) {
    console.error("getIncomingRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.body;

    await Friend.acceptRequest(requestId, userId);

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    console.error("acceptRequest error:", err);
    res.status(400).json({ message: err.message || "Server error" });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const friends = await Friend.getFriends(userId);
    res.json({ count: friends.length, friends });
  } catch (err) {
    console.error("getFriends error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ message: "Friend ID required" });
    }

    await Friend.removeFriend(userId, friendId);

    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error("removeFriend error:", err);
    res.status(400).json({ message: err.message || "Failed to remove friend" });
  }
};


