import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET as string;
async function verifyToken(token: string, secret: string) {
    try {
        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch (err: unknown) {
        console.error(
            "Auth Error (middleware):",
            err instanceof Error ? err.message : "Middleware server error"
        );
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const loginUrl = new URL("/login", request.url);

    const tokenCookie = request.cookies.get("_token");
    const token = tokenCookie?.value;

    if (!token) {
        return NextResponse.redirect(loginUrl);
    }

    const tokenValue = token.startsWith("Bearer")
        ? token.split("Bearer ")[1]
        : token;

    if (!JWT_SECRET) {
        console.error("Missing JWT Secret");
        return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(tokenValue, JWT_SECRET);

    if (!payload) {
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set("_token", "", {
            httpOnly: true,
            path: "/",
            expires: new Date(0),
        });
        return response;
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/order",
        "/orderbeta",
        "/checkout/:id*",
        "/chart",
        "/checkout/payment",
    ],
};
