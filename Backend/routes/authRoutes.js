import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { signUp, signIn, getCurrentUser } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { sendOtpEmail } from "../services/emailService.js";

const router = express.Router();

// Normal auth
router.post("/signup", signUp);
router.post("/signin", signIn);

// Get current user
router.get("/me", protect, getCurrentUser);

// Google OAuth
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username, isDisabled: req.user.isDisabled },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// ─── STEP 1: Send OTP to Email ────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email." });
    }

    if (user.provider === "google") {
      return res.status(400).json({ message: "This account uses Google Sign-In. Password reset is not available." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpiry = expiry;
    await user.save();

    // Send OTP via email
    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: "OTP sent to your email. It expires in 10 minutes." });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── STEP 2: Verify OTP ───────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const user = await User.findOne({ email });

    if (!user || user.provider === "google") {
      return res.status(404).json({ message: "Account not found." });
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ message: "No OTP requested. Please request a new one." });
    }

    if (new Date() > user.resetOtpExpiry) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // OTP is valid — clear it and issue a short-lived reset token
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    const resetToken = jwt.sign(
      { userId: user._id, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({ resetToken, message: "OTP verified. You can now set a new password." });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── STEP 3: Reset Password ───────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({ message: "Reset token and new password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Reset link is invalid or has expired. Please start over." });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ message: "Invalid reset token." });
    }

    const user = await User.findById(decoded.userId);

    if (!user || user.provider === "google") {
      return res.status(404).json({ message: "Account not found." });
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    return res.status(200).json({ message: "Password reset successfully. You can now log in." });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;