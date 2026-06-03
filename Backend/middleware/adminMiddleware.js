import jwt from "jsonwebtoken";

const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, unauthorized." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        
        if (decoded.role !== "admin") {
            return res.status(401).json({ message: "Insufficient permissions." });
        }
        
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

export default verifyAdminToken;
