import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { cookies } from "next/headers";
import { checkJwt } from "@/lib/jwtDecode";

enum OrderProgress {
    waitingCheckout = "waitingCheckout",
    waitingPayment = "waitingPayment",
    confirmOrder = "confirmOrder",
    onProgress = "onProgress",
    deny = "deny",
    finished = "finished",
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log("id");
        const { id } = await params;
        console.log(id);

        if (!id || !id.includes("%")) {
            return httpResponse(422, false, "Invalid input format", null);
        }

        const [orderId, newStatus] = id.split("%");

        if (!orderId || !newStatus) {
            return httpResponse(422, false, "Invalid input data", null);
        }

        const cookieStore = cookies();
        const tokenCookie = (await cookieStore).get("_token");
        const token = tokenCookie?.value;

        if (!token) {
            return Response.json(
                {
                    status: 401,
                    success: false,
                    message: "Unauthorized access!",
                },
                { status: 401 }
            );
        }

        const decodeJwt = await checkJwt(token);
        if (!decodeJwt?.id) {
            return Response.json(
                { status: 403, success: false, message: "Invalid Token" },
                { status: 403 }
            );
        }

        console.log(orderId);

        const updateOrderStatus = await prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: newStatus as OrderProgress,
            },
        });

        if (!updateOrderStatus) {
            return httpResponse(404, false, "Not found", null);
        }

        return httpResponse(
            200,
            true,
            "Success update data",
            updateOrderStatus
        );
    } catch (err: unknown) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
