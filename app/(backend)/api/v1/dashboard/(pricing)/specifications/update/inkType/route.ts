import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { cookies } from "next/headers";

export async function PATCH(request: Request) {
    try {
        const { id, InkType, price } = await request.json();
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

        console.log(id, InkType, price)
        await prisma.inkType.update({
            where: {
                id: id,
            },
            data: {
                InkType,
                price,
            },
        });
        console.log("sampai sini ok")

        return httpResponse(200, true, "success", null);
    } catch (err) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
