import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const token = req.headers.get("cookie");
  if (token) {
    return NextResponse.json({ loggedIn: true, token });
  } else {
    return NextResponse.json({ loggedIn: false });
  }
}