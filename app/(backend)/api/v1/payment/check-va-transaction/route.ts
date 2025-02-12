import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { checkJwt } from "@/lib/jwtDecode";

export async function POST(request: Request) {
  try {
    const { orderId, transactionId } = await request.json();
    const token = request.headers.get("cookie")?.split("_token=")[1];
    if (!token) {
      return httpResponse(401, false, "Unauthorized access!", null);
    }

    const decodeJwt = await checkJwt(token);

    if (!decodeJwt?.id) {
      return httpResponse(403, false, "Invalid JWT", null);
    }

    const checkVa = await prisma.payment.findFirst({
      where: {
        transactionId: transactionId,
      },
    });

    if (!checkVa) {
      return httpResponse(404, false, "Not Found", null);
    }

    const date = new Date(checkVa.expiryTime);

    const formattedDate = date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Makassar",
    });

    const finalFormat = formattedDate.replace(/\//g, "-");

    const payload = {
      vaNumber: checkVa.vaNumber,
      bank: checkVa.bank,
      expiryTime: finalFormat,
      totalPayment: checkVa.grossAmount,
      transactionId: checkVa.transactionId
    };

    return httpResponse(200, true, "Success get data", payload);
  } catch (err: unknown) {
    return httpResponse(
      500,
      false,
      err instanceof Error ? err.message : "Unexpected server error",
      null
    );
  }
}
