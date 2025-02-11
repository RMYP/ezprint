import { eventEmitter } from "@/lib/eventEmitter";

export async function GET(request: Request) {
  try {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const sendNotification = (message: {
          message: string;
          status: boolean;
        }) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
        };

        eventEmitter.on("paymentNotification", sendNotification);

        const cleanUp = () => {
          eventEmitter.off("paymentNotification", sendNotification);
          controller.close();
        };

        const timeoutId = setTimeout(cleanUp, 10 * 60 * 1000);

        request.signal.addEventListener("abort", () => {
          clearTimeout(timeoutId);
          cleanUp();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    return Response.json(
      {
        status: 500,
        success: false,
        message: "SSE failed",
      },
      { status: 500 }
    );
  }
}
