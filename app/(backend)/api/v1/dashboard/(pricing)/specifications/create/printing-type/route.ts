import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const { printingType, price } = await request.json();
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

        if (decodeJwt?.email !== (process.env.ADMIN_EMAIL as String)) {
            return httpResponse(403, false, "Unauthorized access", null);
        }

        const data = await prisma.printingType.create({
            data: {
                printingType,
                price,
            },
        });

        return httpResponse(200, true, "success", data);
    } catch (err) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
