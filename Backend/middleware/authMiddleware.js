import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, unauthorized." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, username }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// Optional auth middleware - extracts user if token is provided, but doesn't fail if missing
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // { id, username }
        } catch (error) {
            console.error("Token verification failed:", error.message);
            // Don't fail, just continue without user
        }
    }
    
    next();
};

export default protect;
export { optionalAuth };