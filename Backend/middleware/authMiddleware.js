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

export default protect;