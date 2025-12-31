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
        if (!decodeJwt?.id) {
            return httpResponse(403, false, "Access Denied", null);
        }

        const model = await prisma.predictionModel.findFirst({
            where: {
                isActive: true,
            },
        });

        return httpResponse(
            200,
            true,
            "Success Retrived Prediction Model",
            model
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
