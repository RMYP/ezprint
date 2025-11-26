import prisma from "../lib/prisma";

async function main() {
    await prisma.dailyPrintSummary.deleteMany();
}

main();
