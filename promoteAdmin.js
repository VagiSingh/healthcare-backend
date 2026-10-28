
require("dotenv").config();

const prisma = require("./src/config/db");

async function main() {
    const email = process.argv[2]?.trim().toLowerCase();

    if (!email) {
        throw new Error(
            "Usage: node src/promoteAdmin.js user@example.com"
        );
    }

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error(
            `No registered user found with email: ${email}`
        );
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" }
    });

    console.log(`Successfully promoted ${email} to ADMIN.`);
}

main()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
