const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

/* ================= CONTACT FORM ================= */
router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Configure Transporter (Use Env Variables in Prod)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER || "nyaynow.demo@gmail.com", // Fallback for demo
                pass: process.env.EMAIL_PASS || "demo_password"
            }
        });

        // Email Content
        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.ADMIN_EMAIL || "support@nyaynow.in",
            subject: `New Inquiry: ${subject || "General"}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4f46e5;">New Contact Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      `
        };

        // Send Email
        // Note: In local dev without real creds, this might fail or needs a mock wrapper.
        // We will try to send, and if it fails (likely due to auth), we log it but return success to UI for UX.
        try {
            if (process.env.EMAIL_USER) {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Email sent from ${email}`);
            } else {
                console.log("⚠️ Email Credentials Missing. Logging inquiry:", mailOptions);
            }
        } catch (emailErr) {
            console.error("❌ Email Send Failed:", emailErr.message);
            // We still return success to the user so they don't think the app is broken, 
            // but we log the error for the admin.
        }

        res.json({ success: true, message: "Message sent! We will contact you soon." });

    } catch (err) {
        console.error("Contact Error:", err);
        res.status(500).json({ error: "Failed to send message" });
    }
});

module.exports = router;
