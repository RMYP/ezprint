import prisma from "@/lib/prisma";
import httpResponse from "@/lib/httpError";
import { checkJwt } from "@/lib/jwtDecode";
import { string } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return httpResponse(422, false, "Invalid input", null);
    }
    const token = request.headers.get("cookie")?.split("_token=")[1];

    if (!token) {
      return httpResponse(401, false, "Unauthorized access!", null);
    }

    const decodeJwt = await checkJwt(token);

    if (!decodeJwt?.id) {
      return httpResponse(403, false, "Invalid JWT", null);
    }

    const getData = await prisma.order.findUnique({
      where: {
        id: id,
      },
    });

    if (!getData) {
      return httpResponse(404, false, "Not Found", null);
    }
    
    return httpResponse(200, true, "Success get data", getData);
  } catch (err: unknown) {
    return httpResponse(
      500,
      false,
      err instanceof Error ? err.message : "Unexpected server error",
      null
    );
  }
}
