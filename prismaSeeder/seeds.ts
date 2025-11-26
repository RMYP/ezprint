import prisma from "../lib/prisma";

// Helper untuk random number
const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
// Helper untuk random array element
const randomElement = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

async function main() {
    console.log("🚀 Memulai proses seeding...");

    // 1. BERSIHKAN DATABASE (Urutan penting karena Foreign Key!)
    // Kita hapus DailyPrintSummary juga untuk memastikan kondisi awal kosong sesuai request
    await prisma.dailyPrintSummary.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.auth.deleteMany();
    await prisma.user.deleteMany();

    console.log("🧹 Database lama telah dibersihkan.");
    console.log(
        "✨ DailyPrintSummary dikosongkan untuk keperluan testing API."
    );

    // 2. BUAT USER DUMMY
    const users = [];
    for (let i = 1; i <= 40; i++) {
        const user = await prisma.user.create({
            data: {
                username: `mahasiswa_${i}`,
                phoneNum: `0812345678${i}`,
                Auth: {
                    create: {
                        email: `user${i}@example.com`,
                        password: "password_dummy_hash", // Password dummy
                    },
                },
            },
        });
        users.push(user);
    }
    console.log(`👤 Berhasil membuat ${users.length} user.`);

    // 3. BUAT TRANSAKSI (ORDER) HISTORIS (30 HARI TERAKHIR)
    // Kita buat data mundur ke belakang agar API processing punya data tanggal lampau
    const documents = [
        "Skripsi_Bab1.pdf",
        "Laporan_Akhir.pdf",
        "Tugas_Besar.docx",
        "Proposal.pdf",
        "KTP.jpg",
    ];
    const paperTypes = ["A4 70gr", "A4 80gr", "F4 70gr", "Art Paper"];
    const finishings = ["Staples", "Jilid Spiral", "Jilid Softcover", "None"];

    let totalOrders = 0;

    // Loop dari 30 hari lalu sampai hari ini
    for (let i = 360; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i); // Mundur i hari

        // Random: Apakah hari ini ada order? (80% peluang ada)
        if (Math.random() > 0.2) {
            // Random jumlah order per hari (1 - 5 order)
            const dailyOrderCount = randomInt(1, 5);

            for (let j = 0; j < dailyOrderCount; j++) {
                const randomUser = randomElement(users);
                const sheetCount = randomInt(10, 150); // 10 - 150 halaman
                const quantity = randomInt(1, 3); // 1 - 3 rangkap
                const pricePerSheet = 500;
                const totalPrice = sheetCount * quantity * pricePerSheet;

                // Tentukan Status Order (Acak)
                // Kita buat mayoritas 'finished' agar terhitung di rekap
                const isFinished = Math.random() > 0.3;
                const status = isFinished ? "finished" : "waitingPayment";

                const order = await prisma.order.create({
                    data: {
                        userId: randomUser.id,
                        documentName: randomElement(documents),
                        documentPath: `/uploads/dummy/${randomInt(
                            1000,
                            9999
                        )}.pdf`,
                        sheetCount: sheetCount,
                        quantity: quantity,
                        paperType: randomElement(paperTypes),
                        finishing: randomElement(finishings),
                        printType: Math.random() > 0.5 ? "Simplex" : "Duplex",
                        inkType:
                            Math.random() > 0.5
                                ? "blackWhite"
                                : "colors",
                        totalPrice: totalPrice,
                        status: status,
                        paymentStatus: isFinished, // Jika finished, payment true
                        orderDate: date, // PENTING: Tanggal dibuat mundur
                    },
                });

                // 4. BUAT PAYMENT (Jika status finished)
                if (isFinished) {
                    await prisma.payment.create({
                        data: {
                            transactionId: `TRX-${order.id
                                .substring(0, 8)
                                .toUpperCase()}`,
                            orderId: order.id,
                            grossAmount: totalPrice.toString(),
                            paymentType: "bank_transfer",
                            bank: "bca",
                            vaNumber: `123456${randomInt(1000, 9999)}`,
                            transactionStatus: "settlement",
                            transactionTime: date,
                            expiryTime: new Date(
                                date.getTime() + 24 * 60 * 60 * 1000
                            ),
                        },
                    });
                }
                totalOrders++;
            }
        }
    }

    console.log(`📦 Berhasil membuat ${totalOrders} transaksi historis.`);
    console.log(
        "✅ Seeding selesai. DailyPrintSummary siap di-isi oleh API Processing."
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
