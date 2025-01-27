import prisma from "@/lib/prisma";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@/lib/envConfig";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const checkAccount = await prisma.auth.findFirst({
      where: {
        email: data.email,
      },
      include: {
        user: true,
      },
    });

    if (!checkAccount) {
      return Response.json(
        {
          status: 404,
          success: false,
          message: "Account not found",
        },
        { status: 404 }
      );
    }

    const checkPassword = bcrypt.compareSync(
      data.password,
      checkAccount.password
    );
    if (!checkPassword) {
      return Response.json(
        {
          status: 403,
          success: false,
          message: "Wrong password!",
        },
        { status: 403 }
      );
    }
    const payload = {
      id: checkAccount.user.id,
      email: checkAccount.email,
      user: checkAccount.user.username,
    };
    const _token =
      "Bearer " +
      jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1d",
      });

    return Response.json(
      {
        status: 201,
        success: true,
        data: {
          _token: _token,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return Response.json(
      {
        status: 500,
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
