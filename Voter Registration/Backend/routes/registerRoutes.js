const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const db = require("../db");
require("dotenv").config();

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function sendOtpEmail(to, otp) {
  return mailer.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your verification code",
    text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
  });
}

// 1. Register — hash password, store user, send OTP
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required." });

  try {
    const hash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Insert or update if already partially registered
    db.query(
      `INSERT INTO users (email, password_hash, otp, otp_expires)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         password_hash = VALUES(password_hash),
         otp = VALUES(otp),
         otp_expires = VALUES(otp_expires),
         totp_secret = NULL`,
      [email, hash, otp, expires],
      async (err) => {
        if (err)
          return res.status(500).json({ message: "Database error." });
        try {
          await sendOtpEmail(email, otp);
          res.json({ message: "OTP sent to your email." });
        } catch {
          res.status(500).json({ message: "Failed to send OTP email." });
        }
      }
    );
  } catch {
    res.status(500).json({ message: "Server error." });
  }
});

// 2. Verify email OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  db.query(
    "SELECT otp, otp_expires FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ message: "User not found." });

      const user = results[0];
      if (user.otp !== otp)
        return res.status(400).json({ message: "Incorrect OTP." });
      if (new Date() > new Date(user.otp_expires))
        return res.status(400).json({ message: "OTP has expired." });

      // Clear OTP after successful verify
      db.query("UPDATE users SET otp = NULL, otp_expires = NULL WHERE email = ?", [email]);
      res.json({ message: "Email verified." });
    }
  );
});

// 3. Generate TOTP secret and return QR code
router.post("/setup-totp", (req, res) => {
  const { email } = req.body;

  const secret = speakeasy.generateSecret({
    name: `VotingSystem (${email})`,
    issuer: "MGITS Voting",
  });

  db.query(
    "UPDATE users SET totp_secret = ? WHERE email = ?",
    [secret.base32, email],
    async (err) => {
      if (err)
        return res.status(500).json({ message: "Database error." });

      try {
        const qr = await QRCode.toDataURL(secret.otpauth_url);
        res.json({ qr });
      } catch {
        res.status(500).json({ message: "QR generation failed." });
      }
    }
  );
});

// 4. Verify TOTP code — completes registration
router.post("/verify-totp", (req, res) => {
  const { email, code } = req.body;

  db.query(
    "SELECT totp_secret FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ message: "User not found." });

      const secret = results[0].totp_secret;
      const valid = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token: code,
        window: 1,
      });

      if (!valid)
        return res.status(400).json({ message: "Invalid code. Try again." });

      res.json({ message: "Registration complete." });
    }
  );
});

// 5. Forgot password — send OTP
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ message: "Email not registered." });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000);

      db.query(
        "UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?",
        [otp, expires, email],
        async (err2) => {
          if (err2)
            return res.status(500).json({ message: "Database error." });
          try {
            await sendOtpEmail(email, otp);
            res.json({ message: "OTP sent." });
          } catch {
            res.status(500).json({ message: "Failed to send email." });
          }
        }
      );
    }
  );
});

// 6. Reset password
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  db.query(
    "SELECT otp, otp_expires FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ message: "User not found." });

      const user = results[0];
      if (user.otp !== otp)
        return res.status(400).json({ message: "Incorrect OTP." });
      if (new Date() > new Date(user.otp_expires))
        return res.status(400).json({ message: "OTP has expired." });

      try {
        const hash = await bcrypt.hash(newPassword, 10);
        db.query(
          "UPDATE users SET password_hash = ?, otp = NULL, otp_expires = NULL WHERE email = ?",
          [hash, email],
          (err2) => {
            if (err2)
              return res.status(500).json({ message: "Database error." });
            res.json({ message: "Password updated." });
          }
        );
      } catch {
        res.status(500).json({ message: "Server error." });
      }
    }
  );
});

module.exports = router;