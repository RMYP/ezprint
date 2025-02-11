import { eventEmitter } from "@/lib/eventEmitter";

export async function GET(request: Request) {
  try {
    const stream = new ReadableStream({
      start(controller) {
        const sendNotification = (message: { message: string; status: boolean }) => {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(message)}\n\n`)
          );
        };
      
        eventEmitter.on("paymentNotification", sendNotification);
      
        const cleanUp = () => {
          eventEmitter.off("paymentNotification", sendNotification);
          controller.close();
        };
      
        request.signal.addEventListener("abort", cleanUp);
      }
      
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    console.error("❗ SSE Error:", err);
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
