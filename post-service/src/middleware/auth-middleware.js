const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const authenticateReq = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

        if (!token) {
            logger.warn("Unauthorized access attempt: No token provided.");
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
        }

        // Verify the JWT token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                logger.warn("Unauthorized access attempt: Invalid token.");
                return res.status(401).json({
                    success: false,
                    message: "Invalid token. Please log in again.",
                });
            }

            req.user = { userId: decoded.userId }; // Attach userId to request
            next(); // Proceed to the next middleware
        });

    } catch (error) {
        logger.error("Error in authentication middleware", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

module.exports = { authenticateReq };
