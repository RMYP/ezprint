import httpResponse from "@/lib/httpError";
import prisma from "@/lib/prisma";
import axios from "axios";
import {
    MidtransBaseUrl,
    AfterPayment,
    midtransCredential,
    BaseUrl,
} from "@/lib/envConfig";
import { NextRequest, NextResponse } from "next/server";
import { checkJwt } from "@/lib/jwtDecode";
import { cookies } from "next/headers";
import { eventEmitter } from "@/lib/eventEmitter";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(id);

        if (!id) {
            return httpResponse(422, false, "Invalid status", null);
        }

        const cookieStore = cookies();
        const tokenCookie = (await cookieStore).get("_token");
        const token = tokenCookie?.value;

        if (!token) {
            return httpResponse(401, false, "Unauthorized access!", null);
        }

        const decodeJwt = await checkJwt(token);
        if (!decodeJwt?.id) {
            return httpResponse(403, false, "Invalid JWT", null);
        }

        const checkStatus = await prisma.payment.findFirst({
            where: { transactionId: id },
            orderBy: { transactionTime: "desc" },
            take: 1,
            select: { transactionStatus: true },
        });

        if (checkStatus?.transactionStatus === "settlement") {
            return httpResponse(201, true, "paymentSuccess", null);
        }

        // call Midtrans
        const getTransaction = await axios.get(
            `${MidtransBaseUrl}v2/${id}/status`,
            {
                headers: {
                    accept: "application/json",
                    Authorization: `Basic ${midtransCredential}`,
                },
            }
        );
        if (getTransaction.data?.transaction_status === "settlement") {
            const paymentData = await prisma.payment.findFirst({
                where: { transactionId: id },
                select: { orderId: true },
            });

            if (paymentData) {
                await prisma.$transaction([
                    prisma.payment.updateMany({
                        where: { transactionId: id },
                        data: { transactionStatus: "settlement" },
                    }),
                    prisma.order.update({
                        where: { id: paymentData.orderId },
                        data: {
                            paymentStatus: true,
                            status: "onProgress",
                        },
                    }),
                ]);
            }

            eventEmitter.emit("orderUpdate")
            return NextResponse.json({
                status: 200,
                success: true,
                message: "Payment updated to settlement",
            });
        }

        return NextResponse.json({
            status: 200,
            success: false,
            message: "Payment still pending",
        });
    } catch (err: unknown) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
