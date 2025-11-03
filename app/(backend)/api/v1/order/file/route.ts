import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import prisma from "@/lib/prisma";
import { checkJwt } from "@/lib/jwtDecode";
import { DocPath } from "@/lib/envConfig";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return Response.json(
                { status: 400, success: false, message: "Invalid request" },
                { status: 400 }
            );
        }

        const cookieStore = cookies();
        const tokenCookie = cookieStore.get("_token");
        const token = tokenCookie?.value; //
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
        console.log("asasd");
        if (!decodeJwt?.id) {
            return Response.json(
                { status: 403, success: false, message: "Invalid Token" },
                { status: 403 }
            );
        }

        console.log(decodeJwt, "jokowi");
        const uploadDir = DocPath;
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.resolve(uploadDir, file.name);

        const buffer = await file.arrayBuffer();
        const writePromise = writeFile(filePath, Buffer.from(buffer));

        const orderPromise = prisma.order.create({
            data: {
                documentPath: filePath,
                documentName: file.name,
                userId: decodeJwt.id,
                orderDate: new Date(),
            },
        });

        const [order] = await Promise.all([orderPromise, writePromise]);

        return Response.json(
            {
                status: 201,
                success: true,
                message: "File uploaded successfully",
                data: order,
            },
            { status: 201 }
        );
    } catch (err: unknown) {
        return Response.json({
            status: 500,
            success: false,
            message: err,
        });
    }
}
