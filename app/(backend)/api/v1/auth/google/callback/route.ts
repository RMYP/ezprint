import { oauth2Client } from "@/lib/envConfig";
import { google } from "googleapis";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/envConfig";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authData = request.nextUrl.searchParams;
  const code = authData.get("code");

  if (!code) {
    return Response.json({ error: "No code provided" }, { status: 400 });
  }

  const { tokens } = await oauth2Client.getToken(code as string);
  if (!tokens || !tokens.access_token) {
    return Response.json({ error: "Invalid token" }, { status: 400 });
  }

  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  if (data && data.email) {
    const checkAccount = await prisma.auth.findFirst({
      where: {
        email: data.email,
      },
    });

    if (!checkAccount) {
      await prisma.user.create({
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
    }
  }

  const token = jwt.sign(
    { id: data.id, email: data.email, name: data.name, picture: data.picture },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const response = NextResponse.redirect(
    new URL("/home", request.nextUrl.origin)
  );
  response.cookies.set("_token", `Bearer${token}`, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
