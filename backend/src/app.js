const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads only
app.use("/uploads", express.static(
  path.join(__dirname, "../uploads")
));

// TEMP CORS (OK since frontend not deployed yet)
app.use(cors());
app.get("/", (req, res) => {
  res.send("🚀 Public Space Backend is Running");
});
// Health check
app.get("/api", (req, res) => {
  res.send("Backend API is running ✅");
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/friends", require("./routes/friend.routes"));
app.use("/api/posts", require("./routes/post.routes"));

module.exports = app;
