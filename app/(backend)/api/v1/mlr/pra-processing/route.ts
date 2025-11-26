import { cookies } from "next/headers";
import { checkJwt } from "@/lib/jwtDecode";
import { AdminEmail } from "@/lib/envConfig";
import prisma from "@/lib/prisma";
import {
    checkIsHoliday,
    checkIsPeakAcademik,
} from "@/hooks/featureEngineering";

export async function GET(request: Request) {
    try {
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
        if (!decodeJwt?.id || decodeJwt?.email !== AdminEmail) {
            return Response.json(
                { status: 403, success: false, message: "Invalid Token" },
                { status: 403 }
            );
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        let processedCount = 0;
        const errors = [];

        const currentDay = new Date(startOfMonth);

        while (currentDay <= endOfMonth) {
            try {
                const startOfDay = new Date(currentDay);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(currentDay);
                endOfDay.setHours(23, 59, 59, 999);

                const aggregation = await prisma.order.aggregate({
                    _sum: {
                        sheetCount: true,
                    },
                    where: {
                        status: "finished",
                        orderDate: {
                            gte: startOfDay,
                            lte: endOfDay,
                        },
                    },
                });

                const totalSheets = aggregation._sum.sheetCount || 0;

                const dayOfWeeks = startOfDay.getDay();
                const isWeekend = dayOfWeeks == 1 || dayOfWeeks == 0 ? 1 : 0;
                const isHoliday = checkIsHoliday(startOfDay);
                const isAcademicDay = checkIsPeakAcademik(startOfDay);

                await prisma.dailyPrintSummary.upsert({
                    where: {
                        date: startOfDay,
                    },
                    update: {
                        totalSheets: totalSheets,
                        isWeekend: isWeekend + 1,
                        isHoliday: isHoliday,
                        isPeakAcademic: isAcademicDay,
                    },
                    create: {
                        date: startOfDay,
                        totalSheets: totalSheets,
                        isWeekend: isWeekend,
                        isHoliday: isHoliday,
                        isPeakAcademic: isAcademicDay,
                    },
                });

                processedCount++;
            } catch (err: any) {
                console.error(
                    `Gagal memproses tanggal ${currentDay.toISOString()}:`,
                    err
                );
                errors.push({
                    date: currentDay.toISOString(),
                    error: err.message,
                });
            }

            currentDay.setDate(currentDay.getDate() + 1);
        }

        return Response.json({
            success: true,
            message: `Batch processing selesai. ${processedCount} hari berhasil diproses.`,
            period: `${startOfMonth.toISOString().split("T")[0]} - ${
                endOfMonth.toISOString().split("T")[0]
            }`,
            errors: errors.length > 0 ? errors : null,
        });
    } catch (err: unknown) {
        console.error("[CRON ERROR]", err);
        return Response.json(
            {
                success: false,
                error:
                    err instanceof Error
                        ? err.message
                        : "Unexpected Server Errro",
            },
            { status: 500 }
        );
    }
}
