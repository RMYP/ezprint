import httpResponse from "@/lib/httpError";
import prisma from "@/lib/prisma";
import axios from "axios";
import {
  MidtransBaseUrl,
  AfterPayment,
  midtransCredential,
  MidtransServerKey,
} from "@/lib/envConfig";
import { NextResponse } from "next/server";
import { checkJwt } from "@/lib/jwtDecode";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return httpResponse(422, false, "Invalid status", null);
    }

    // Still not sure if i need to use token in this route
    const token = request.headers.get("cookie")?.split("_token=")[1];
    if (!token) {
      return httpResponse(401, false, "Unauthorized access!", null);
    }

    const decodeJwt = await checkJwt(token);

    if (!decodeJwt?.id) {
      return httpResponse(403, false, "Invalid JWT", null);
    }

    const checkStatus = await prisma.payment.findFirst({
      where: {
        transactionId: id,
      },
      orderBy: {
        transactionTime: "desc",
      },
      take: 1,
      select: {
        transactionStatus: true,
      },
    });

    if (checkStatus?.transactionStatus == "settlement") {
      return NextResponse.redirect(AfterPayment);
    }

    console.log(`${MidtransBaseUrl}/v2/${id}/status`);
    console.log(`Basic ${MidtransServerKey}`);
    const getTransaction = await axios.get(
      `${MidtransBaseUrl}/v2/${id}/status`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Basic ${midtransCredential}`,
        },
      }
    );

    if (getTransaction.data) {
      if (getTransaction.data.transaction_status == "settlement") {
        await prisma.payment.updateMany({
          where: {
            transactionId: id,
          },
          data: {
            transactionStatus: "settlement",
          },
        });

        return NextResponse.redirect(AfterPayment);
        // return httpResponse(201, true, "Payment success", null);
      }
    }
    return NextResponse.redirect(AfterPayment);
    // return httpResponse(200, true, "Payment not verified", null);
  } catch (err: unknown) {
    return httpResponse(
      500,
      false,
      err instanceof Error ? err.message : "Unexpected server error",
      null
    );
  }
}
