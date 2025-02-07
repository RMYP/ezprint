import httpError from "@/lib/httpError";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log(payload)
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
