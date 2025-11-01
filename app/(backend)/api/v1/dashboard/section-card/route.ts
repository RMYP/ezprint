import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";

export async function GET(request: Request) {
    try {
        const token = request.headers.get("cookie")?.split("_token=")[1];
        if (!token) {
            return httpResponse(401, false, "Unauthorized access!", null);
        }
        
        const decodeJwt = await checkJwt(token);
        if (!decodeJwt?.id) {
            return httpResponse(403, false, "Invalid Token", null);
        }

        const now = new Date();
        const firstDayOfThisMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );
        const firstDayOfNextMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );

        const getChart = await prisma.order.findMany({
            where: {
                orderDate: {
                    gte: firstDayOfThisMonth,
                    lt: firstDayOfNextMonth,
                },
            },
            select: {
                id: true,
                documentName: true,
                paperType: true,
                status: true,
                sheetCount: true,
                quantity: true,
                Payment: {
                    select: { grossAmount: true },
                },
                user: true,
            },
            orderBy: {
                orderDate: "desc",
            },
        });

        const totalRevenue = getChart.reduce((acc, order) => {
            const orderTotal = order.Payment.reduce((sum, pay) => {
                const cleanGross = pay.grossAmount
                    ?.replace(/[^\d]/g, "")
                    ?.trim();

                const gross = parseInt(cleanGross || "0", 10);
                return sum + gross;
            }, 0);
            return acc + orderTotal;
        }, 0);

        const finishedCount = getChart.filter(
            (o) => o.status === "finished"
        ).length;
        const notFinishedCount = getChart.filter(
            (o) => o.status !== "finished"
        ).length;

        console.log(getChart)
        const data = {
            totalRevenue,
            finishedCount,
            notFinishedCount,
            getChart,
        };

        console.log(data);
        return httpResponse(200, true, "Success get data", data);
    } catch (err: unknown) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
