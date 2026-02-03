const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const interactionController = require("../controllers/interaction.controller");
const shareController = require("../controllers/share.controller");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload"); // 🔥 cloudinary

router.post(
  "/create",
  auth,
  upload.single("media"), // 🔥 uploads directly to Cloudinary
  postController.createPost
);

router.get("/all", auth, postController.getAllPosts);
router.get("/limit", auth, postController.getPostLimitInfo);

router.post("/like", auth, interactionController.likePost);
router.post("/unlike", auth, interactionController.unlikePost);
router.post("/comment", auth, interactionController.commentPost);

router.post("/share", auth, shareController.sharePost);
router.delete("/delete", auth, postController.deletePost);

module.exports = router;
