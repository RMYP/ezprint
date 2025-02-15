import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("cookie")?.split("_token=")[1];
    if (!token) {
      return httpResponse(401, false, "Unauthorized access!", null);
    }

    const decodeJwt = await checkJwt(token);
    if (!decodeJwt?.id) {
      return httpResponse(403, false, "Invalid Token", null);
    }

    const getChart = await prisma.order.findMany({
      where: {
        userId: decodeJwt.id,
      },
      include: {
        Payment: {
          orderBy: {
            transactionTime: "desc",
          },
          take: 1,
        },
      },orderBy: {
        orderDate: "desc"
      }
    });

    if (!getChart) {
      return httpResponse(404, false, "Not found", null);
    }

    return httpResponse(200, true, "Success get data", getChart);
  } catch (err: unknown) {
    return httpResponse(
      500,
      false,
      err instanceof Error ? err.message : "Unexpected server error",
      null
    );
  }
}
