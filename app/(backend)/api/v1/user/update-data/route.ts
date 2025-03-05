import httpResponse from "@/lib/httpError";
import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/envConfig";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const { id, phoneNum, username, email } = await request.json();

    if (!id) {
      return httpResponse(422, false, "Invalid input", null);
    }

    const token = request.headers.get("cookie")?.split("_token=")[1];

    if (!token) {
      return Response.json(
        { status: 401, success: false, message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    const decodeJwt = await checkJwt(token);
    if (!decodeJwt?.id) {
      return Response.json(
        { status: 403, success: false, message: "Invalid Token" },
        { status: 403 }
      );
    }

    const updateUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        username: username,
        phoneNum: phoneNum,
      },
      select: {
        id: true,
        username: true,
        phoneNum: true,  
      },
    });

    if (!updateUser) {
      return httpResponse(404, false, "Not found", null);
    }

    const payload = {
      id: updateUser.id,
      user: updateUser.username,
      email: email,
      phoneNum: updateUser.phoneNum,
    };

    const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    const response = NextResponse.json({
      status: 201,
      success: true,
      message: "Login successful",
    });

    response.cookies.set("_token", `Bearer${newToken}`, {
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
