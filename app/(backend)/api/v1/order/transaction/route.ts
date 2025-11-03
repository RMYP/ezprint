import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    try {
        const cookieStore = cookies();
        const tokenCookie = (await cookieStore).get("_token");
        const token = tokenCookie?.value;
        if (!token) {
            return httpResponse(401, false, "Unauthorized access!", null);
        }

        const decodeJwt = await checkJwt(token);
        if (!decodeJwt?.id) {
            return httpResponse(403, false, "Invalid Token", null);
        }

        const getTransaction = await prisma.order.findMany({
            where: {
                userId: decodeJwt.id,
                status: "onProgress",
            },
            include: {
                Payment: {
                    orderBy: {
                        transactionTime: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                orderDate: "desc",
            },
        });

        if (!getTransaction) {
            return httpResponse(404, false, "Not found", null);
        }

        return httpResponse(200, true, "Success get data", getTransaction);
    } catch (error) {}
}
