import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { checkJwt } from "@/lib/jwtDecode";
import { cookies } from "next/headers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const cookieStore = cookies();
        const tokenCookie = (await cookieStore).get("_token");
        const token = tokenCookie?.value;

        if (!id || !token) {
            return httpResponse(
                400,
                false,
                "Invalid Input or Unauthorized Access",
                null
            );
        }

        const decodeJwt = await checkJwt(token);

        if (!decodeJwt?.id) {
            return httpResponse(403, false, "Invalid JWT", null);
        }

        const getOrder = await prisma.order.findFirst({
            where: { id, userId: decodeJwt.id },
            include: {
                user: true,
            },
        });

        if (
            !getOrder ||
            typeof getOrder.estimatedTime_Machine !== "number" ||
            typeof getOrder.estimatedTime_Operator !== "number"
        ) {
            return httpResponse(404, false, "Order Not Found", null);
        }

        const formattedPayment = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(getOrder.totalPrice));

        const payload = {
            totalSheet: getOrder.sheetCount,
            totalPayment: formattedPayment,
            paperType: getOrder.paperType,
            quantity: getOrder.quantity,
            documentName: getOrder.documentName,
            username: getOrder.user.username,
            phoneNumber: getOrder.user.phoneNum,
            printType: getOrder.printType,
            durationMinutes:
                (getOrder.estimatedTime_Machine +
                    getOrder.estimatedTime_Operator) /
                60,
        };
        return httpResponse(200, true, "Success GET data", payload);
    } catch (err: unknown) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
