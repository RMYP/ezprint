import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { checkJwt } from "@/lib/jwtDecode";
import { cookies } from "next/headers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) return httpResponse(422, false, "Invalid Input", null);

        const cookiesStore = cookies();
        const getCookies = (await cookiesStore).get("_token");
        const token = getCookies?.value;

        if (!token)
            return httpResponse(401, false, "Unauthorized Access!", null);

        const decodeJwt = await checkJwt(token);

        if (!decodeJwt?.id && decodeJwt?.id !== process.env.ADMIN_EMAIL)
            return httpResponse(403, false, "Invalid JWT", null);

        const updateStatus = await prisma.$transaction(async (tx) => {
            await tx.predictionModel.updateMany({
                data: {
                    isActive: false,
                },
            });
            return await tx.predictionModel.update({
                where: {
                    id: id,
                },
                data: {
                    isActive: true,
                },
            });
        });

        return httpResponse(200, true, "Success", null);
    } catch (err) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected Server Error!",
            null
        );
    }
}
