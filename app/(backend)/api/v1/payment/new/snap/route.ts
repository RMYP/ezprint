import { snap } from "@/lib/midtransConfig";
import prisma from "@/lib/prisma";
import { checkJwt } from "@/lib/jwtDecode";
import { randomUUID as uuidv4 } from "crypto";
import httpResponse from "@/lib/httpError";
import { cookies } from "next/headers";
import { BaseUrl } from "@/lib/envConfig";

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        const cookieStore = cookies();
        const tokenCookie = (await cookieStore).get("_token");
        const token = tokenCookie?.value;
        if (!id || !token)
            return httpResponse(400, false, "Invalid Input", null);
        const decodeJwt = await checkJwt(token);
        if (!decodeJwt?.id)
            return httpResponse(403, false, "Invalid JWT", null);

        const getOrder = await prisma.order.findFirst({
            where: {
                id,
                userId: decodeJwt.id,
            },
            include: {
                user: true,
            },
        });

        if (!getOrder) return httpResponse(404, false, "Order not found", null);
        if (!getOrder.totalPrice)
            return httpResponse(404, false, "Order not found", null);

        const transactionId = uuidv4();
        const ADMIN_FEE = 1000;

        const createSnapParams = (getOrder: any) => {
            if (getOrder.totalPrice < 50000) {
                return {
                    transaction_details: {
                        order_id: transactionId,
                        gross_amount: getOrder.totalPrice + ADMIN_FEE,
                    },
                    item_details: [
                        {
                            id: getOrder.id,
                            price: getOrder.totalPrice,
                            quantity: getOrder.quantity,
                            name: `Cetak Dokumen (${getOrder.sheetCount} lbr)`,
                            category: getOrder.printType,
                        },
                        {
                            id: "ADMIN-FEE",
                            price: ADMIN_FEE,
                            quantity: 1,
                            name: "Biaya Layanan/Admin",
                            category: "FEE",
                        },
                    ],
                    customer_details: {
                        first_name: getOrder.user.username,
                        email: decodeJwt.email,
                        phone: getOrder.user.phoneNum || "",
                    },
                    callbacks: { finish: `${BaseUrl}/` },
                };
            }
            return {
                transaction_details: {
                    order_id: transactionId,
                    gross_amount: getOrder.totalPrice,
                },
                item_details: [
                    {
                        id: getOrder.id,
                        price: getOrder.totalPrice,
                        quantity: getOrder.quantity,
                        name: `Cetak Dokumen (${getOrder.sheetCount} lbr)`,
                        category: getOrder.printType,
                    },
                ],
                customer_details: {
                    first_name: getOrder.user.username,
                    email: decodeJwt.email,
                    phone: getOrder.user.phoneNum || "",
                },
                callbacks: { finish: `${BaseUrl}/` },
            };
        };

        const snapParameter = createSnapParams(getOrder);
        const snapResponse = await snap.createTransaction(snapParameter);
        const snapToken = snapResponse.token;

        await prisma.$transaction([
            prisma.order.update({
                where: { id },
                data: { status: "waitingPayment" },
            }),
            prisma.payment.create({
                data: {
                    id: uuidv4(),
                    transactionId: transactionId,
                    orderId: getOrder.id,
                    grossAmount: getOrder.totalPrice!.toString(),
                    paymentType: "snap_pending",
                    transactionTime: new Date(),
                    expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    transactionStatus: "pending",
                    vaNumber: "-",
                    bank: "-",
                },
            }),
        ]);

        return httpResponse(200, true, "Snap Token Created", {
            token: snapToken,
            orderId: getOrder.id,
            transactionId: transactionId,
        });
    } catch (err: unknown) {
        console.error("Snap Error:", err);
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Server error",
            null
        );
    }
}
