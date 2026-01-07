import { FonnteClientKey } from "./envConfig";
import { formatPhoneNumber } from "./helper";
import prisma from "./prisma";
import logger from "@/lib/logger";

type Payload = {
    orderId: string;
    phone: string;
    name: string;
};

export const triggerWhatsAppNotification = async (payload: Payload) => {
    const API_KEY = FonnteClientKey;

    const message = `*PESANAN SELESAI* 🥳

Halo *${payload.name}*, 
Ada kabar baik! Pesanan Anda telah selesai diproses.

📦 *Detail Pesanan:*
ID: #${payload.orderId}

Silakan ambil pesanan Anda di *Toko EzPrint*. Jangan lupa tunjukkan ID pesanan saat pengambilan.

Terima kasih telah mencetak di tempat kami! ✨`;
    try {
        const response = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
                Authorization: API_KEY || "",
            },
            body: new URLSearchParams({
                target: formatPhoneNumber(payload.phone),
                message: message,
                delay: "2",
            }),
        });

        const result = await response.json();
        if (result.status == false) {
            try {
                await prisma.notificationLog.create({
                    data: {
                        orderId: payload.orderId,
                        status: "false",
                        reason: result.reason,
                    },
                });
            } catch (err) {
                logger.error(
                    `Whatsapp notification Faild ${payload.orderId}: ${
                        err instanceof Error ? err.message : "Unexpected Error"
                    }`
                );
            }
        }
        return result;
    } catch (err) {
        logger.error(
            `Whatsapp notification Failed at higher level${payload.orderId}: ${
                err instanceof Error ? err.message : "Unexpected Error"
            }`
        );
    }
};
