const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const prisma = require("../config/db");

const protect = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Authentication required. Please log in.", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        throw new AppError("Authentication token is missing", 401);
    }

    if (!process.env.JWT_SECRET) {
        throw new AppError("Server authentication is not configured", 500);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
            id: true,
            name: true,
            email: true
        }
    });

    if (!user) {
        throw new AppError("User associated with this token no longer exists", 401);
    }

    req.user = user;
    next();
});

module.exports = { protect };