import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { signUp, signIn, getCurrentUser } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";

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

// ─── STEP 1: Verify Username + Email ──────────────────────────────
// User proves identity by providing both username AND email.
// If they match a local account in the DB, proceed to reset.
router.post("/verify-identity", async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: "Username and email are required." });
    }

    const user = await User.findOne({ username, email });

    if (!user) {
      return res.status(404).json({ message: "No account found with that username and email combination." });
    }

    if (user.provider === "google") {
      return res.status(400).json({ message: "This account uses Google Sign-In. Password reset is not available." });
    }

    // Identity confirmed — allow reset
    return res.status(200).json({ message: "Identity verified. You can now set a new password." });

  } catch (error) {
    console.error("Verify identity error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── STEP 2: Reset Password ───────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({ username, email });

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