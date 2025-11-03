import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { checkJwt } from "@/lib/jwtDecode";
import { cookies } from "next/headers";

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
        if (!decodeJwt?.id) {
            return Response.json(
                { status: 403, success: false, message: "Invalid Token" },
                { status: 403 }
            );
        }

        const getUser = await prisma.user.findUnique({
            where: {
                id: decodeJwt.id,
            },
            include: {
                Auth: true,
            },
        });

        if (!getUser) {
            return httpResponse(404, false, "Not found", null);
        }

        const payload = {
            id: getUser.id,
            username: getUser.username,
            phoneNumber: getUser.phoneNum,
            email: getUser.Auth?.email,
        };

        return httpResponse(200, true, "Success", payload);
    } catch (err: unknown) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
