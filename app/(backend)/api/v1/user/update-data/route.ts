import httpResponse from "@/lib/httpError";
import { checkJwt } from "@/lib/jwtDecode";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { id, phoneNum, username } = await request.json();

    if (!id) {
      return httpResponse(422, false, "Invalid input", null);
    }

    const token = request.headers.get("cookie")?.split("_token=")[1];

    if (!token) {
      return Response.json(
        { status: 401, success: false, message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    const decodeJwt = await checkJwt(token);
    if (!decodeJwt?.id) {
      return Response.json(
        { status: 403, success: false, message: "Invalid Token" },
        { status: 403 }
      );
    }

    const updateUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        username: username,
        phoneNum: phoneNum,
      },
    });

    if (!updateUser) {
      return httpResponse(404, false, "Not found", null);
    }

    const payload = {
      username: updateUser.username,
      phoneNum: updateUser.phoneNum,
    };

    return httpResponse(200, true, "Success", payload);
  } catch (err: unknown) {
    return httpResponse(
      500,
      false,
      err instanceof Error ? err.message : "Unexpected server error",
      null
    );
  }
}
