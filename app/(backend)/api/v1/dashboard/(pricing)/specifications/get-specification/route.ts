import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { cookies } from "next/headers";

export async function GET() {
    try {
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

        const [paperTypes, finishingOptions, printingTypes, inkTypes] =
            await Promise.all([
                prisma.paperGsmPrice.findMany({
                    orderBy: { price: "asc" },
                }),
                prisma.finishingOption.findMany({
                    orderBy: { price: "asc" },
                }),
                prisma.printingType.findMany({
                    orderBy: { price: "asc" },
                }),
                prisma.inkType.findMany({
                    orderBy: { price: "asc" },
                }),
            ]);

        const data = {
            inkType: inkTypes,
            printingType: printingTypes,
            finishingOption: finishingOptions,
            paperGsm: paperTypes,
        };

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
