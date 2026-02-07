const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");

/* -------------------- MULTER SETUP -------------------- */
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: function (req, file, cb) {
        cb(null, "post-" + Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

/* -------------------- GET FEED -------------------- */
// GET /api/posts
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name role") // Populate author details
            .sort({ createdAt: -1 }); // Newest first
        res.json(posts);
    } catch (err) {
        console.error("Fetch posts err:", err);
        res.status(500).json({ error: "Failed to fetch feed" });
    }
});

/* -------------------- CREATE POST -------------------- */
// POST /api/posts (Multipart for file upload + content)
router.post("/", upload.single("file"), async (req, res) => {
    try {
        const { content, type, email } = req.body;
        let fileUrl = "";

        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const newPost = new Post({
            content,
            type: type || "text",
            mediaUrl: fileUrl,
            author: user._id,
        });

        await newPost.save();

        // Return populated post for immediate UI update
        const populatedPost = await Post.findById(newPost._id).populate("author", "name role");
        res.json(populatedPost);

    } catch (err) {
        console.error("Create post err:", err);
        res.status(500).json({ error: "Failed to create post" });
    }
});

/* -------------------- LIKE POST -------------------- */
// POST /api/posts/:id/like
router.post("/:id/like", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Toggle like
        const index = post.likes.indexOf(user._id);
        if (index === -1) {
            post.likes.push(user._id);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        console.error("Like err:", err);
        res.status(500).json({ error: "Like failed" });
    }
});

/* -------------------- COMMENT ON POST -------------------- */
// POST /api/posts/:id/comment
router.post("/:id/comment", async (req, res) => {
    try {
        const { email, text } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = {
            user: user._id,
            text,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        // Populate the new comment's user details for immediate UI return
        // We can't populate just one, so we have to return the user info manually or re-fetch
        // For efficiency, let's just return the comment with manual user info attached for the frontend
        const returnedComment = {
            ...comment,
            user: { _id: user._id, name: user.name, role: user.role, name: user.name }
        };

        res.json(returnedComment);
    } catch (err) {
        console.error("Comment err:", err);
        res.status(500).json({ error: "Comment failed" });
    }
});

module.exports = router;
