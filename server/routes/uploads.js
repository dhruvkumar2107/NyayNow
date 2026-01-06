const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let upload;

// Use Cloudinary if keys are present (Production/Scalable)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "nyay-sathi-uploads",
      allowed_formats: ["jpg", "png", "jpeg", "pdf", "doc", "docx"],
    },
  });
  upload = multer({ storage: storage });
  console.log("☁️ Using Cloudinary for uploads");
} else {
  // Fallback to local disk (Dev/Fallback)
  const uploadDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  upload = multer({ storage: storage });
  console.log("📂 Using Local Disk for uploads (Warning: Ephemeral on Serverless)");
}

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "File missing" });

  // If Cloudinary, `req.file.path` is the URL. If local, we construct it.
  const filePath = req.file.path || `/uploads/${req.file.filename}`;

  res.json({
    path: filePath,
    original: req.file.originalname,
  });
});

module.exports = router;
