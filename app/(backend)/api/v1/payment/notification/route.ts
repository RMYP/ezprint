import httpError from "@/lib/httpError";

export async function POST(request: Request) {
  try {
    console.log("masuk notifications")
    const payload = await request.json();
    return Response.json({
        payload
    })
  } catch (err: unknown) {
    return httpError(
      500,
      false,
      err instanceof Error ? err.message : "Unexpected server error",
      null
    );
  }
}
