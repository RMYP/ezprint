// app/(backend)/api/v1/pricing-options/route.ts
import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";

export async function GET() {
    try {
        const [
            paperTypes,
            finishingOptions,
            printingTypes,
            inkTypes,
            predictionModel,
        ] = await Promise.all([
            prisma.paperGsmPrice.findMany({
                orderBy: { price: "asc" },
            }),
            prisma.finishingOption.findMany({
                orderBy: { price: "asc" },
            }),
            prisma.printingType.findMany({
                orderBy: { price: "asc" },
            }),
            prisma.inkType.findMany({
                orderBy: { price: "asc" },
            }),
            prisma.predictionModel.findFirst({
                where: {
                    isActive: true,
                },
            }),
        ]);

        const data = {
            paperGsm: paperTypes,
            finishingOption: finishingOptions,
            printingType: printingTypes,
            inkType: inkTypes,
            predictionModel: predictionModel,
        };

        return httpResponse(200, true, "Success get pricing options", data);
    } catch (err: unknown) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
