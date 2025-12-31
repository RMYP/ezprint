import { eventEmitter } from "@/lib/eventEmitter";
import prisma from "@/lib/prisma";

// my first time using SSE so i think its a good idea to add a comment hahahaha
export async function GET() {
    // Inisialisasi TextEncoder untuk mengubah string menjadi Uint8Array (format yang dibutuhkan stream)
    const encoder = new TextEncoder();

    // Membuat aliran data (ReadableStream) untuk mengirimkan pesan secara berkelanjutan ke klien
    const stream = new ReadableStream({
        async start(controller) {
            // Fungsi internal untuk mengambil data antrean terbaru dan mengirimkannya ke klien
            const sendQueueData = async () => {
                const [activeModel, ongoingOrders] = await Promise.all([
                    prisma.predictionModel.findFirst({
                        where: { isActive: true },
                    }),
                    prisma.order.findMany({
                        where: {
                            status: { in: ["confirmOrder", "onProgress"] },
                        },
                    }),
                ]);

                /**
                 * PIPELINING:
                 * Menghitung total beban antrean mesin. Hanya menghitung waktu pengerjaan mesin (coeffImpresi).
                 * Waktu jilid tidak dihitung sebagai beban antrean mesin karena mesin bisa langsung
                 * mengerjakan pesanan berikutnya segera setelah porsi cetak selesai.
                 */
                const currentQueueTime = ongoingOrders.reduce((acc, o) => {
                    const isColor = o.inkType === "Warna" ? 1 : 0;
                    const isDuplex = o.printType
                        ?.toLowerCase()
                        .includes("duplex")
                        ? 1
                        : 0;

                    const machineTime =
                        (activeModel?.constant || 0) +
                        (o.sheetCount || 0) * (activeModel?.coeffImpresi || 0) +
                        isColor * (activeModel?.coeffWarna || 0) +
                        isDuplex * (activeModel?.coeffSisi || 0);

                    return acc + machineTime;
                }, 0);

                // Menyusun data dalam format JSON
                const data = JSON.stringify({
                    currentQueueTime: Math.ceil(currentQueueTime), // Total menit antrean mesin (dibulatkan ke atas)
                    activeOrdersCount: ongoingOrders.length, // Jumlah pesanan yang sedang aktif di sistem
                });

                // Memasukkan data ke dalam stream dengan format SSE (harus diawali 'data: ' dan diakhiri '\n\n')
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            };

            // Mengirimkan data untuk pertama kali segera setelah koneksi terbuka
            await sendQueueData();

            // Membuat fungsi listener yang akan dipicu setiap kali ada event 'orderUpdated'
            const listener = async () => await sendQueueData();

            // Mendaftarkan listener ke eventEmitter (misal: saat admin update status atau user baru bayar)
            eventEmitter.on("orderUpdated", listener);

            // Fungsi pembersihan (cleanup) untuk menghentikan listener saat koneksi SSE ditutup oleh klien/browser
            return () => eventEmitter.off("orderUpdated", listener);
        },
    });

    // Mengembalikan response dengan header khusus agar browser mengenalinya sebagai aliran SSE
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream", // Menentukan tipe konten sebagai aliran event
            "Cache-Control": "no-cache", // Memastikan data tidak disimpan di cache browser (selalu fresh)
            Connection: "keep-alive", // Menjaga koneksi HTTP tetap terbuka
        },
    });
}
