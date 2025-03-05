import prisma from "@/lib/prisma";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@/lib/envConfig";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const checkAccount = await prisma.auth.findFirst({
      where: { email: data.email },
      include: { user: true },
    });

    if (!checkAccount) {
      return NextResponse.json(
        { status: 404, success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    const checkPassword = bcrypt.compareSync(
      data.password,
      checkAccount.password
    );
    
    if (!checkPassword) {
      return NextResponse.json(
        { status: 403, success: false, message: "Wrong password!" },
        { status: 403 }
      );
    }

    const payload = {
      id: checkAccount.user.id,
      email: checkAccount.email,
      user: checkAccount.user.username,
      phone: checkAccount.user.phoneNum
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    const response = NextResponse.json({
      status: 201,
      success: true,
      message: "Login successful",
    });

    response.cookies.set("_token", `Bearer${token}`, { 
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: err instanceof Error ? err.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
