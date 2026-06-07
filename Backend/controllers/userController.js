import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ─── SIGN UP ──────────────────────────────────────────────
export const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: "Email already registered." });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({ message: "Username already taken." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            provider: "local",
        });

        const token = jwt.sign(
            { id: newUser._id, username: newUser.username, isDisabled: newUser.isDisabled },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully.",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                isDisabled: newUser.isDisabled,
            },
        });

    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

// ─── SIGN IN ──────────────────────────────────────────────
export const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.provider === "google") {
            return res.status(403).json({ message: "Please sign in with Google." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, isDisabled: user.isDisabled },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isDisabled: user.isDisabled,
            },
        });

    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

// ─── GET CURRENT USER ──────────────────────────────────────────────
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .populate('savedFiles', 'title category thumbnail')
            .select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            savedFiles: user.savedFiles.map(file => file._id.toString()),
            isDisabled: user.isDisabled,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};