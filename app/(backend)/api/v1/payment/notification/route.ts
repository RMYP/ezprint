import crypto from "crypto";
import prisma from "@/lib/prisma";
import { eventEmitter } from "@/lib/eventEmitter";
import { MidtransServerKey } from "@/lib/envConfig";

function generateSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string
) {
  const rawSignature = orderId + statusCode + grossAmount + serverKey;
  return crypto.createHash("sha512").update(rawSignature).digest("hex");
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_id
    } = payload;

    const expectedSignature = generateSignature(
      order_id,
      status_code,
      gross_amount,
      MidtransServerKey
    );

    if (signature_key !== expectedSignature) {
      return Response.json(
        { status: 401, message: "Invalid signature" },
        { status: 401 }
      );
    }

    if (transaction_status === "settlement") {
      eventEmitter.emit("paymentNotification", {
        message: "Payment Success",
        status: true,
      });
    }

    const getId = await prisma.payment.findFirst({
      where: {
        transactionId: transaction_id
      }
    })

    await prisma.$transaction([
      prisma.payment.updateMany({
        where: { transactionId: transaction_id },
        data: { transactionStatus: transaction_status },
      }),
      prisma.order.update({
        where: { id: getId?.orderId },
        data: {
          paymentStatus: transaction_status === "settlement",
          status: "onProgress",
        },
      }),
    ]);

    return Response.json(
      { status: 200, message: "Notification processed" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { status: 500, message: "Server error" },
      { status: 500 }
    );
  }
}
