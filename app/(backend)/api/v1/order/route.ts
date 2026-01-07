import prisma from "@/lib/prisma";
import { checkJwt } from "@/lib/jwtDecode";
import httpError from "@/lib/httpError";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const {
            sheetCount,
            paperType,
            finishing,
            quantity,
            printType,
            totalPrice,
            fieldId,
            notes,
            inkType,
        } = await request.json();

        const cookieStore = cookies();
        const tokenCookie = (await cookieStore).get("_token");
        const token = tokenCookie?.value;

        if (!token) {
            return httpError(401, false, "Unauthorized access!", null);
        }

        const decodeJwt = await checkJwt(token);
        if (!decodeJwt?.id) {
            return httpError(403, false, "Invalid JWT", null);
        }

        const [paperData, finishingData, inkData, predictionModel] =
            await Promise.all([
                prisma.paperGsmPrice.findFirst({
                    where: { gsm: paperType },
                    select: { price: true },
                }),
                prisma.finishingOption.findFirst({
                    where: { finishingType: finishing },
                    select: { price: true },
                }),
                prisma.inkType.findFirst({
                    where: { InkType: inkType },
                    select: { price: true },
                }),
                prisma.predictionModel.findFirst({
                    where: {
                        isActive: true,
                    },
                }),
            ]);

        if (!paperData || !inkData || !finishingData || !predictionModel) {
            console.log({ paperData, inkData, finishingData, predictionModel });
            return httpError(
                500,
                false,
                "Database Error: Data referensi tidak ditemukan",
                null
            );
        }

        const calculatedTotalPrice =
            ((paperData.price + inkData.price) * sheetCount +
                finishingData.price) *
            quantity;

        if (calculatedTotalPrice !== totalPrice) {
            return httpError(
                400,
                false,
                "Harga tidak valid / telah berubah",
                null
            );
        }

        const getJilidQty = () => {
            const isJilid = finishing.toLowerCase().includes("jilid");
            return isJilid ? quantity : 0;
        };

        const rawMachineDuration =
            predictionModel.constant +
            sheetCount * quantity * predictionModel.coeffImpresi +
            (inkType === "Hitam Putih" ? 0 : 1 * predictionModel.coeffWarna) +
            (printType.toLowerCase().includes("satu sisi")
                ? 0
                : 1 * predictionModel.coeffSisi);

        const rawOparatorDuration = getJilidQty() * predictionModel.coeffJilid;

        const calculatedEstimatedTimeMachine = Math.ceil(rawMachineDuration);
        const calculatedEstimatedTimeOperator = Math.ceil(rawOparatorDuration);

        const createCheckout = await prisma.order.update({
            where: {
                id: fieldId,
            },
            data: {
                sheetCount: sheetCount,
                paperType: paperType,
                finishing: finishing,
                quantity: quantity,
                printType: printType,
                totalPrice: totalPrice,
                status: "waitingCheckout",
                paymentStatus: false,
                notes: notes,
                inkType: inkType,
                estimatedTime_Machine: calculatedEstimatedTimeMachine,
                estimatedTime_Operator: calculatedEstimatedTimeOperator,
            },
        });

        return httpError(201, true, "Checkout successful", createCheckout);
    } catch (err: unknown) {
        return httpError(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
