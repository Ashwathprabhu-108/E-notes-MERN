import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { signUp, signIn } from "../controllers/userController.js";

const router = express.Router();

// Normal auth
router.post("/signup", signUp);
router.post("/signin", signIn);

// Google OAuth
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

export default router;