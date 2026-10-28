const AppError = require("../utils/AppError");

const errorMiddleware = (err, req, res, next) => {
    let error = err;

    
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        Object.prototype.hasOwnProperty.call(err, "body")
    ) {
        error = new AppError("Invalid JSON in request body", 400);
    }

    
    if (err.name === "JsonWebTokenError") {
        error = new AppError("Invalid authentication token", 401);
    } else if (err.name === "TokenExpiredError") {
        error = new AppError("Authentication token has expired", 401);
    }

    
    if (err.code === "P2002") {
        error = new AppError("A record with this value already exists", 409);
    } else if (err.code === "P2025") {
        error = new AppError("Requested record was not found", 404);
    } else if (err.code === "P2003") {
        error = new AppError("Invalid related record reference", 400);
    } else if (err.code === "P2014") {
        error = new AppError("Operation violates a required relationship", 400);
    } else if (err.code === "P2000") {
        error = new AppError("A supplied value exceeds the allowed length", 400);
    }

    const statusCode = error.statusCode || 500;
    const isProduction = process.env.NODE_ENV === "production";

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message: error.isOperational || !isProduction
            ? error.message
            : "Internal server error",
        ...(isProduction ? {} : { stack: err.stack })
    });
};

module.exports = errorMiddleware;