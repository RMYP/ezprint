import { coreAPI } from "@/lib/midtransConfig";
import prisma from "@/lib/prisma";
import { checkJwt } from "@/lib/jwtDecode";
import { randomUUID as uuidv4 } from "crypto";
import httpError from "@/lib/httpError";

export async function POST(request: Request) {
  try {
    const { id, bank } = await request.json();
    const token = request.headers.get("cookie")?.split("_token=")[1];

    if (!id || !bank) {
      return httpError(400, false, "Invalid Input", null);
    }

    if (!token) {
      return httpError(403, false, "Forbidden Access", null);
    }

    const decodeJwt = await checkJwt(token);
    if (!decodeJwt?.id) {
      return httpError(403, false, "Invalid JWT", null);
    }

    const getOrder = await prisma.order.findFirst({
      where: {
        id: id,
        userId: decodeJwt.id,
      },
    });

    if (!getOrder) {
      return httpError(404, false, "Order Not Found", null);
    }

    const createCharge = await coreAPI.charge({
      payment_type: "bank_transfer",
      bank_transfer: { bank: bank },
      transaction_details: {
        order_id: uuidv4(),
        gross_amount: getOrder.totalPrice,
      },
      item_details: [
        {
          id: getOrder.id,
          name: getOrder.documentPath,
          price: getOrder.totalPrice,
          quantity: getOrder.quantity,
          category: getOrder.printType,
        },
      ],
    });

    return httpError(200, true, "Charge Created Successfully", createCharge);
  } catch (err: unknown) {
    console.log(err);
    return httpError(
      500,
      false,
      err instanceof Error ? err.message : "Unexpected server error",
      null
    );
  }
}
