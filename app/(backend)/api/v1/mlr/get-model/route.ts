import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { cookies } from "next/headers";
import { checkJwt } from "@/lib/jwtDecode";

export async function GET() {
    try {
        const cookieStore = cookies();
        const getCookies = (await cookieStore).get("_token");
        const token = getCookies?.value;

        if (!token) return httpResponse(401, false, "Unauthorized!", null);

        const decodeJwt = await checkJwt(token);
        if (!decodeJwt?.id || decodeJwt?.email !== process.env.ADMIN_EMAIL) {
            return httpResponse(403, false, "Access Denied", null);
        }

        const getData = await prisma.predictionModel.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return httpResponse(
            200,
            true,
            "Success Retrived Prediction Model",
            getData
        );
    } catch (err) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected Server Error",
            null
        );
    }
}
