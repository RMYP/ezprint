import { eventEmitter } from "@/lib/eventEmitter";
import prisma from "@/lib/prisma";

export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendQueueData = async () => {
                const queueStats = await prisma.order.aggregate({
                    where: {
                        status: { in: ["confirmOrder", "onProgress"] },
                    },
                    _sum: {
                        estimatedTime_Machine: true,
                        estimatedTime_Operator: true,
                    },
                });

                const machineTime = queueStats._sum.estimatedTime_Machine ?? 0;
                const operatorTime =
                    queueStats._sum.estimatedTime_Operator ?? 0;

                const data = JSON.stringify({
                    currentMachineQueueTime: Math.ceil(machineTime),
                    currentOperatorQueueTime: Math.ceil(operatorTime),
                });

                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            };

            await sendQueueData();

            const listener = async () => await sendQueueData();

            eventEmitter.on("orderUpdated", listener);

            return () => eventEmitter.off("orderUpdated", listener);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
