const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const upload = multer({ dest: uploadDir });
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "File missing" });
  const publicPath = `/uploads/${req.file.filename}`;
  res.json({
    path: publicPath,
    original: req.file.originalname
  });
});
module.exports = router;
