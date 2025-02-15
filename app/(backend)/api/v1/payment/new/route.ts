import { coreAPI, regularBankParameter } from "@/lib/midtransConfig";
import prisma from "@/lib/prisma";
import { checkJwt } from "@/lib/jwtDecode";
import { randomUUID as uuidv4 } from "crypto";
import httpError from "@/lib/httpError";

export async function POST(request: Request) {
  try {
    const { id, bank, paymentType } = await request.json();
    const token = request.headers.get("cookie")?.split("_token=")[1];

    if (!id || !bank || !paymentType || !token) {
      return httpError(
        400,
        false,
        "Invalid Input or Unauthorized Access",
        null
      );
    }

    const decodeJwt = await checkJwt(token);
    if (!decodeJwt?.id) {
      return httpError(403, false, "Invalid JWT", null);
    }

    const getOrder = await prisma.order.findFirst({
      where: { id, userId: decodeJwt.id },
    });

    if (!getOrder) {
      return httpError(404, false, "Order Not Found", null);
    }

    const transactionId = uuidv4();
    const itemDetails = {
      id: getOrder.id,
      name: getOrder.documentPath,
      price: getOrder.totalPrice,
      quantity: getOrder.quantity,
      category: getOrder.printType,
    };

    const chargePayload = regularBankParameter(
      paymentType,
      bank,
      transactionId,
      getOrder.totalPrice,
      itemDetails
    );

    const createCharge = await coreAPI.charge(chargePayload);

    const vaNumber =
      bank == "mandiri"
        ? createCharge.bill_key
        : bank == "permata"
        ? createCharge.permata_va_number
        : createCharge.va_numbers[0].va_number;

    const formattedPayment = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(createCharge.gross_amount));

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: "waitingPayment" },
      }),
      prisma.payment.create({
        data: {
          id: uuidv4(),
          transactionId: createCharge.transaction_id,
          orderId: getOrder.id,
          grossAmount: formattedPayment,
          paymentType: createCharge.payment_type,
          transactionTime: new Date(createCharge.transaction_time), 
          expiryTime: new Date(createCharge.expiry_time), 
          transactionStatus: createCharge.transaction_status,
          vaNumber,
          bank,
        },
      }),
    ]);

    createCharge.order_id = getOrder.id;

    return httpError(200, true, "Charge Created Successfully", createCharge);
  } catch (err: unknown) {
    return httpError(
      500,
      false,
      err instanceof Error ? err.message : "Unexpected server error",
      null
    );
  }
}
