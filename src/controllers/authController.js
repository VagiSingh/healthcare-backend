const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const createToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new AppError("Server authentication is not configured", 500);
    }

    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
};


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new AppError("Name, email, and password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new AppError("Please provide a valid email address", 400);
    }

    if (password.length < 8) {
        throw new AppError("Password must be at least 8 characters long", 400);
    }

    if (name.trim().length > 100) {
        throw new AppError("Name cannot exceed 100 characters", 400);
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
    });

    if (existingUser) {
        throw new AppError("An account with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
        }
    });

    const token = createToken(user);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user
    });
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new AppError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError("Invalid email or password", 401);
    }

    const token = createToken(user);

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

module.exports = {
    registerUser,
    loginUser
};