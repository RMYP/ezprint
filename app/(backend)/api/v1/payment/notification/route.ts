import httpError from "@/lib/httpError";
import prisma from "@/lib/prisma";
import { eventEmitter } from "@/lib/eventEmitter";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    await Promise.all([
      prisma.payment.update({
        where: {
          id: payload.transaction_id,
        },
        data: {
          transactionStatus: payload.transaction_status,
        },
      }),

      prisma.order.update({
        where: {
          id: payload.order_id,
        },
        data: {
          paymentStatus:
            payload.transaction_status == "settlement" ? true : false,
          status: "onProgress",
        },
      }),
    ]);

    // will be used to trigger SSE
    if(payload.transaction_status == "settlement") {
      eventEmitter.emit("paymentNotification", {
        message: "Payment Success",
        status: true
      })
    }
    
    return Response.json(
      {
        status: 200,
        message: "Notifications success",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    return httpError(
      500,
      false,
      err instanceof Error ? err.message : "Unexpected server error",
      null
    );
  }
}
