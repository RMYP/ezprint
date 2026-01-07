import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { triggerWhatsAppNotification } from "@/lib/whatsapp";
import { NextResponse } from "next/server";
import httpStatus from "@/lib/httpError";
import { eventEmitter } from "@/lib/eventEmitter";

export async function PATCH(request: Request) {
    try {
        const data = await request.json();

        const cookieStore = cookies();
        const tokenCookie = (await cookieStore).get("_token");
        const token = tokenCookie?.value;

        if (!token) {
            return NextResponse.json(
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
            return NextResponse.json(
                { status: 403, success: false, message: "Invalid Token" },
                { status: 403 }
            );
        }

        if (!data.id && !data.status) {
            return NextResponse.json(
                {
                    status: 422,
                    success: false,
                    message: "Unprocessable Entity!",
                },
                { status: 422 }
            );
        }

        const order = await prisma.order.update({
            where: {
                id: data.id,
            },
            data: {
                status: data.status,
            },
            include: {
                user: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                {
                    status: 404,
                    success: false,
                    message: "File not found in database",
                },
                { status: 404 }
            );
        }

        if (data.status == "finished") {
            try {
                const payload = {
                    orderId: order.id,
                    phone: order.user.phoneNum || "",
                    name: order.user.username,
                };
                payload && (await triggerWhatsAppNotification(payload));
            } catch (err) {
                console.error("WhatsApp Notification Error:", err);
            }
        }

        eventEmitter.emit("orderUpdate");
        const payload = {
            currentStatus: data.status,
            selectedStatus: order.status,
        };
        return httpStatus(200, true, "success", payload);
    } catch (err: unknown) {
        console.error("Download error:", err);
        return NextResponse.json(
            {
                status: 500,
                success: false,
                message:
                    err instanceof Error
                        ? err.message
                        : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
