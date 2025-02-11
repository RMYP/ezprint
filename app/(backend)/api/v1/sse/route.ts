import { eventEmitter } from "@/lib/eventEmitter";

export async function GET() {
  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const sendNotification = (message: {
          message: string;
          status: boolean;
        }) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}`)
          );
        };

        eventEmitter.on("paymentNotification", sendNotification);

        const cleanUp = () => {
          eventEmitter.off("paymentNotification", sendNotification);
          controller.close();
        };

        setTimeout(cleanUp, 10 * 60 * 1000);
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
