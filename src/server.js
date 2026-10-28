require("dotenv").config();

const app = require("./app");
const prisma = require("./config/db");

const PORT = process.env.PORT || 5000;

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing from the environment");
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing from the environment");
    process.exit(1);
}

const server = app.listen(PORT, () => {
    console.log(`Healthcare API running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down...`);

    server.close(async () => {
        try {
            await prisma.$disconnect();
            process.exit(0);
        } catch (error) {
            console.error("Error disconnecting from database:", error);
            process.exit(1);
        }
    });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));