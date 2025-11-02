import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "./envConfig";
import prisma from "./prisma";

interface JwtPayloadWithId extends jwt.JwtPayload {
  id: string;
  email: string;
  user: string;
  iat: number;
  exp: number;
}

export async function checkJwt(token: string) {
  try {
    if (!token) return null;
    if (!token.startsWith("Bearer")) return null;
    const bearerToken = token.split("Bearer")[1];
    console.log("checkjwt", bearerToken)
    const decoded = jwt.verify(bearerToken, JWT_SECRET) as JwtPayloadWithId;
    decoded.token = token;
    return decoded;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw Error(err.message);
    } else {
      console.log(err);
    }
  }
}

export async function checkAuthorizationJwt(token: string, id: string) {
  try {
    console.log(token);
    if (!token.startsWith("Bearer ")) {
      throw {
        status: 422,
        success: false,
        message: "Invalid Format",
      };
    }

    const bearerToken = token.split("Bearer ")[1];

    let decoded;
    try {
      decoded = jwt.verify(bearerToken, JWT_SECRET) as JwtPayloadWithId;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw {
          status: 401,
          success: false,
          message: err.message,
        };
      } else {
        throw {
          status: 401,
          success: false,
          message: "JWT verification failed",
        };
      }
    }

    if (decoded.id !== id) {
      throw {
        status: 404,
        success: false,
        message: "Account not found",
      };
    }

    const checkAccount = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!checkAccount) {
      throw {
        status: 404,
        success: false,
        message: "Account not found",
      };
    }
    return;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      "success" in err &&
      "message" in err
    ) {
      throw err;
    } else if (err instanceof Error) {
      throw {
        status: 500,
        success: false,
        message: err.message,
      };
    } else {
      throw {
        status: 500,
        success: false,
        message: "Unexpected server error",
      };
    }
  }
}
