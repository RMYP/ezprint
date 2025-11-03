import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { cookies } from "next/headers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log("idBe");
        const { id } = await params;
        console.log("idBe", id);

        if (!id) {
            return httpResponse(422, false, "Invalid input", null);
        }
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

        const orderDetail1 = await prisma.order.findUnique({
            where: {
                id: id,
            },
            include: {
                user: true,
                Payment: true,
            },
        });

        if (!orderDetail1?.user.id) {
            return httpResponse(404, false, "Not Found", null);
        }
        const email = await prisma.auth.findUnique({
            where: {
                userId: orderDetail1.user.id,
            },
            select: {
                email: true,
            },
        });

        console.log(email);
        const orderDetail = {
            ...orderDetail1,
            email,
        };
        if (!orderDetail1) {
            return httpResponse(404, false, "Not Found", null);
        }

        return httpResponse(200, true, "Success get data", orderDetail);
    } catch (err: unknown) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
