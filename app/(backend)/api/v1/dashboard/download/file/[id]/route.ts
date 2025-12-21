import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import fs from "fs";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const cookieStore = cookies();
        const tokenCookie = (await cookieStore).get("_token");
        const token = tokenCookie?.value;

        if (!token) {
            return NextResponse.json(
                { status: 401, success: false, message: "Unauthorized access!" },
                { status: 401 }
            );
        }

        const decodeJwt = await checkJwt(token);
        if (!decodeJwt?.id) {
            return NextResponse.json(
                { status: 403, success: false, message: "Invalid Token" },
                { status: 403 }
            );
        }

        const order = await prisma.order.findUnique({
            where: {
                id: id,
            },
        });

        if (!order) {
            return NextResponse.json(
                { status: 404, success: false, message: "File not found in database" },
                { status: 404 }
            );
        }

        if (order.userId !== decodeJwt.id && decodeJwt.email !== process.env.ADMIN_EMAIL) { 
             return NextResponse.json(
                { status: 403, success: false, message: "Forbidden access to this file" },
                { status: 403 }
            );
        }

      
        if (!fs.existsSync(order.documentPath)) {
            return NextResponse.json(
                { status: 404, success: false, message: "Physical file not found on server" },
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(order.documentPath);

        const response = new NextResponse(new Uint8Array(fileBuffer));

        response.headers.set("Content-Type", "application/pdf");
        response.headers.set(
            "Content-Disposition",
            `attachment; filename="${order.documentName}"`
        );

        return response;

    } catch (err: unknown) {
        console.error("Download error:", err);
        return NextResponse.json({
            status: 500,
            success: false,
            message: err instanceof Error ? err.message : "Internal Server Error",
        }, { status: 500 });
    }
}