const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|pdf|doc|docx)$/i;
const ALLOWED_MIMES = /^(image\/jpeg|image\/png|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function checkMagicBytes(buffer) {
  if (!buffer || buffer.length < 4) return false;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
  // PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return true;
  // DOCX / ZIP: 50 4B 03 04
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) return true;
  // DOC (OLE2): D0 CF 11 E0
  if (buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0) return true;
  return false;
}

// Always use memory storage so we can inspect file bytes before persisting
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const extOk  = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));
    const mimeOk = ALLOWED_MIMES.test(file.mimetype);
    if (extOk && mimeOk) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File missing" });

  if (!checkMagicBytes(req.file.buffer)) {
    return res.status(400).json({ error: "File content does not match declared type" });
  }

  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Stream buffer directly to Cloudinary
      const url = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "nyay-sathi-uploads" },
          (err, result) => (err ? reject(err) : resolve(result.secure_url))
        );
        stream.end(req.file.buffer);
      });
      return res.json({ path: url, original: req.file.originalname });
    }

    // Local disk fallback
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    const ext      = path.extname(req.file.originalname);
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    res.json({ path: `/uploads/${filename}`, original: req.file.originalname });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
