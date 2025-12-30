import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const {
            modelName,
            constant,
            coeffImpresi,
            coeffWarna,
            coeffSisi,
            coeffJilid,
        } = data.data;
        console.log(modelName);
        const cookieStore = cookies();
        const tokenCookie = (await cookieStore).get("_token");
        const token = tokenCookie?.value;
        if (!token) return httpResponse(401, false, "Unauthorized!", null);

        const decodeJwt = await checkJwt(token);
        if (!decodeJwt?.id || decodeJwt?.email !== process.env.ADMIN_EMAIL) {
            return httpResponse(403, false, "Access Denied", null);
        }

        const result = await prisma.$transaction(async (tx) => {
            await tx.predictionModel.updateMany({
                data: { isActive: false },
            });

            return await tx.predictionModel.create({
                data: {
                    modelName: modelName,
                    constant: constant,
                    coeffImpresi: coeffImpresi,
                    coeffWarna: coeffWarna,
                    coeffSisi: coeffSisi,
                    coeffJilid: coeffJilid,
                    isActive: true,
                },
            });
        });

        return httpResponse(
            200,
            true,
            "Model baru berhasil diaktifkan",
            result
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
