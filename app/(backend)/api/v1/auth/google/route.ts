import { NextResponse } from "next/server";
import { oauth2Client } from "@/lib/envConfig";

export async function GET(request: Request) {
  try {
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["email", "profile"],
      include_granted_scopes: true,
    });

    return NextResponse.redirect(authorizationUrl);
  } catch (err: unknown) {
    console.error("OAuth Error:", err);

    // ✅ Always return a response, even in case of an error
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
