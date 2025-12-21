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
            inkType
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
                inkType: inkType
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
