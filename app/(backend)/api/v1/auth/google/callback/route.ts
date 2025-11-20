import { oauth2Client } from "@/lib/envConfig";
import { google } from "googleapis";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { JWT_SECRET } from "@/lib/envConfig";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const authData = request.nextUrl.searchParams;
        const code = authData.get("code");

        if (!code) {
            return Response.json(
                { error: "No code provided" },
                { status: 400 }
            );
        }

        const { tokens } = await oauth2Client.getToken(code);
        if (!tokens || !tokens.access_token) {
            return Response.json({ error: "Invalid token" }, { status: 400 });
        }

        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        let checkUser;
        if (data && data.email) {
            const checkAuth = await prisma.auth.findFirst({
                where: { email: data.email },
                include: {
                    user: true,
                },
            });

            checkUser = checkAuth?.user.id;
            if (!checkAuth) {
                const createUser = await prisma.user.create({
                    data: {
                        username: data.name!,
                        Auth: {
                            create: {
                                email: data.email!,
                                password: data.id!,
                            },
                        },
                    },
                });

                checkUser = createUser.id;
            }

            const payload = {
                id: checkUser,
                email: data.email,
                name: data.name,
                picture: data.picture,
                phone: checkAuth?.user.phoneNum,
            };
            // const token = jwt.sign({}, JWT_SECRET, { expiresIn: "1d" });
            const secretKey = new TextEncoder().encode(JWT_SECRET);
            const token = await new SignJWT(payload)
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("1d")
                .sign(secretKey);

            const response = NextResponse.redirect(
                new URL("/home", request.nextUrl.origin)
            );
            response.cookies.set("_token", `Bearer ${token}`, {
                httpOnly: true,
                path: "/",
                maxAge: 60 * 60 * 24, // 1 day
                secure: true,
                sameSite: "lax",
            });

            return response;
        } else {
            return Response.json(
                { error: "Email not found in Google data" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("OAuth Error:", error);
        return Response.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unexpected server error",
            },
            { status: 500 }
        );
    }
}
