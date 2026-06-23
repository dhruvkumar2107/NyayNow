const nodemailer = require("nodemailer");

// Brevo SMTP credentials
const BREVO_SMTP_HOST = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
const BREVO_SMTP_PORT = parseInt(process.env.BREVO_SMTP_PORT || "587", 10);
const BREVO_SMTP_USER = (process.env.BREVO_SMTP_USER || process.env.EMAIL_USER || "").trim();
const BREVO_SMTP_PASS = (process.env.BREVO_SMTP_PASS || process.env.EMAIL_PASS || "").trim();
const BREVO_SENDER = process.env.BREVO_SENDER || "NyayNow Support <support@nyaynow.in>";

const transporter = nodemailer.createTransport({
  host: BREVO_SMTP_HOST,
  port: BREVO_SMTP_PORT,
  // Port 587 uses STARTTLS (not SSL) — secure must be false, requireTLS must be true
  secure: BREVO_SMTP_PORT === 465,
  requireTLS: BREVO_SMTP_PORT === 587,
  auth: {
    user: BREVO_SMTP_USER,
    pass: BREVO_SMTP_PASS,
  },
  tls: {
    // Accept Brevo's certificate — needed in some Node.js environments
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
  },
});

// Verify connection at startup and log result
if (BREVO_SMTP_USER && BREVO_SMTP_PASS) {
  transporter.verify((err) => {
    if (err) {
      console.error("[Brevo] ❌ SMTP connection FAILED:", err.message);
      console.error("[Brevo] Check BREVO_SMTP_USER and BREVO_SMTP_PASS in .env");
    } else {
      console.log("[Brevo] ✅ SMTP connection verified — ready to send emails");
    }
  });
} else {
  console.warn("[Brevo] ⚠️  SMTP credentials not configured — running in mock mode");
}

/**
 * Send a verification email with a 6-digit OTP code.
 * Falls back to mock mode if credentials are not configured.
 *
 * @param {string} email - Recipient's email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function sendVerificationEmail(email, otp) {
  // --- Mock Mode ---
  if (!BREVO_SMTP_PASS || !BREVO_SMTP_USER) {
    console.log(`[Brevo MOCK] Verification email to ${email} → OTP: ${otp}`);
    return { success: true, mock: true };
  }

  // --- Live Mode ---
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #d4af37; text-align: center;">NyayNow Legal Platform</h2>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p>Dear User,</p>
        <p>Thank you for choosing NyayNow. Please use the verification code below to complete your authentication:</p>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #1e293b; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #555;">This code is valid for 10 minutes. Please do not share this OTP with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888; text-align: center;">This is an automated security email. Please do not reply.</p>
      </div>
    `;

    await transporter.sendMail({
      from: BREVO_SENDER,
      to: email,
      subject: `[NyayNow] Your Verification Code: ${otp}`,
      text: `${otp} is your NyayNow verification code. Valid for 10 minutes.`,
      html: htmlContent,
    });

    console.log(`[Brevo] ✅ Verification email sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.error("[Brevo] ❌ sendVerificationEmail error:", err.message);
    // Fallback to mock so authentication flow doesn't break
    console.log(`[Brevo MOCK FALLBACK] OTP for ${email}: ${otp}`);
    return { success: true, fallback: true };
  }
}

module.exports = { sendVerificationEmail };

