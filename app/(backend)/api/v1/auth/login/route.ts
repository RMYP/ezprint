import prisma from "@/lib/prisma";
import { SignJWT } from "jose";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@/lib/envConfig";
import { NextResponse } from "next/server";
import httpResponse from "@/lib/httpError";

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const checkAccount = await prisma.auth.findFirst({
            where: { email: { equals: data.email, mode: "insensitive" } },
            include: { user: true },
        });

        if (!checkAccount) {
            return httpResponse(404, false, "Account not found", null);
        }

        const checkPassword = bcrypt.compareSync(
            data.password,
            checkAccount.password
        );

        if (!checkPassword) {
            return httpResponse(403, false, "Wrong password!", null);
        }

        const payload = {
            id: checkAccount.user.id,
            email: checkAccount.email,
            user: checkAccount.user.username,
            phone: checkAccount.user.phoneNum,
        };

        // const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

        // Jose

        const secretKey = new TextEncoder().encode(JWT_SECRET);
        const token = await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1d")
            .sign(secretKey);

        // end Jose

        const response = NextResponse.json({
            status: 201,
            success: true,
            message: "Login successful",
        });

        response.cookies.set("_token", `Bearer ${token}`, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (err: unknown) {
        return httpResponse(
            500,
            false,
            err instanceof Error ? err.message : "Unexpected server error",
            null
        );
    }
}
