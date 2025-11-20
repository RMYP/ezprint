import { NextResponse } from "next/server";

export async function GET() {
    const response = NextResponse.json({ message: "Logged out" });

    response.cookies.set("token", "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
        secure: true,
        sameSite: "lax",
    });
    return response;
}
