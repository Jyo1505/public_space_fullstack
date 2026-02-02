const express = require("express");
const cors = require("cors");
const path = require("path");


const app = express();

// existing middlewares...

app.use(express.urlencoded({ extended: true }));

// serve uploaded files statically from /uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(cors());
app.use(express.json());


// ✅ Serve uploaded images/videos
app.use("/uploads", express.static(
  path.join(__dirname, "../uploads")
));

// Serve frontend
app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

app.get("/api", (req, res) => {
  res.send("Backend API is running ✅");
});

// Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const friendRoutes = require("./routes/friend.routes");
const postRoutes = require("./routes/post.routes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);  // 👈 IMPORTANT
app.use("/api/posts", postRoutes);

// ✅ Default route → index.html
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/index.html")
  );
});

module.exports = app;

