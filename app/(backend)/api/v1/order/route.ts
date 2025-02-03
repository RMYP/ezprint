import prisma from "@/lib/prisma";
import { checkJwt } from "@/lib/jwtDecode";
import path from "path";

export async function POST(request: Request) {
  try {
    const {
      sheetCount,
      paperType,
      finishing,
      quantity,
      printType,
      totalPrice,
      fieldId
    } = await request.json();

    const token = request.headers.get("authorization");

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

    if (!decodeJwt?.id) {
      return Response.json(
        {
          status: 403,
          success: false,
          message: "Invalid JWT",
        },
        { status: 403 }
      );
    }

    const createCheckout = await prisma.order.update({
      where: {
        id: fieldId,
      },
      data: {
        sheetCount: sheetCount,
        paperType: paperType,
        finishing: finishing,
        quantity: quantity,
        printType: printType,
        totalPrice: totalPrice,
        status: false,
        paymentStatus: false,
      },
    });

    return Response.json(
      {
        status: 201,
        success: true,
        data: createCheckout,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return Response.json(
      {
        status: 500,
        success: false,
        message: err instanceof Error ? err.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
