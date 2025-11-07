"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Download,
    User,
    CreditCard,
    Hash,
    Paperclip,
    Calendar,
    Loader2,
} from "lucide-react";

// Ganti import ini dengan path yang benar ke action Anda
import { getOrderWorkingRoom } from "@/app/(frontend)/action/action";

// (Salin semua Enum dan Interface Anda dari file asli ke sini)
// --- Enum dan Interface ---
enum OrderProgress {
    waitingCheckout = "waitingCheckout",
    waitingPayment = "waitingPayment",
    confirmOrder = "confirmOrder",
    onProgress = "onProgress",
    deny = "deny",
    finished = "finished",
}

enum TransactionStatus {
    pending = "pending",
    settlement = "settlement",
    capture = "capture",
    deny = "deny",
    cancel = "cancel",
    expire = "expire",
}

interface UserAuthDetails {
    email: string;
}

interface UserDetails {
    id: string;
    username: string;
    phoneNum: string | null;
    Auth: UserAuthDetails;
}

interface PaymentDetails {
    id: string;
    transactionId: string;
    orderId: string;
    grossAmount: string;
    paymentType: string;
    transactionTime: Date;
    expiryTime: Date;
    vaNumber: string;
    bank: string;
    transactionStatus: TransactionStatus;
}

interface User {
    email: string;
}

interface OrderDetails {
    id: string;
    sheetCount: number;
    paperType: string;
    finishing: string;
    quantity: number;
    printType: string;
    totalPrice: number;
    status: OrderProgress;
    paymentStatus: boolean;
    documentPath: string;
    documentName: string;
    email: User;
    userId: string;
    orderDate: Date;
    user: UserDetails;
    Payment: PaymentDetails[];
}

const statusOptions = [
    { value: OrderProgress.confirmOrder, label: "Konfirmasi Pesanan" },
    { value: OrderProgress.onProgress, label: "Sedang Diproses" },
    { value: OrderProgress.finished, label: "Selesai (Siap Diambil)" },
    { value: OrderProgress.deny, label: "Ditolak" },
];

// const mockOrder: OrderDetails = {
//     id: "ord_12345ABC",
//     sheetCount: 150,
//     paperType: "80gsm",
//     finishing: "Jilid Soft Cover",
//     quantity: 2,
//     printType: "Cetak Dua Sisi (duplex)",
//     totalPrice: 86000,
//     status: OrderProgress.onProgress,
//     paymentStatus: true,
//     documentPath: "/files/skripsi-bab-1-revisi.pdf",
//     documentName: "skripsi-bab-1-revisi.pdf",
//     userId: "user_67890",
//     orderDate: new Date("2025-10-30T10:30:00Z"),
//     user: {
//         id: "user_67890",
//         username: "Budi Gunawan",
//         phoneNum: "081234567890",
//         Auth: {
//             email: "budi.gunawan@email.com",
//         },
//     },
//     Payment: [
//         {
//             id: "pay_XYZ",
//             transactionId: "mid_ABC123",
//             orderId: "ord_12345ABC",
//             grossAmount: "Rp 86.000",
//             paymentType: "bank_transfer",
//             transactionTime: new Date("2025-10-30T10:32:00Z"),
//             expiryTime: new Date("2025-10-31T10:32:00Z"),
//             vaNumber: "8800123456789",
//             bank: "bca",
//             transactionStatus: TransactionStatus.settlement,
//         },
//     ],
// };

const getStatusLabel = (status: OrderProgress): string => {
    return (
        statusOptions.find((opt) => opt.value === status)?.label ??
        status.toString()
    );
};

const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "N/A";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
};

const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

function DetailItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-md font-medium break-words">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const [order, setOrder] = useState<OrderDetails | null>(null);

    const [currentStatus, setCurrentStatus] = useState<OrderProgress | null>(
        null
    );
    const [selectedStatus, setSelectedStatus] = useState<OrderProgress | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            setIsPageLoading(true); // Mulai loading di sini
            try {
                const { id } = await params;

                if (id) {
                    const data = await getOrderWorkingRoom(id);
                    setOrder(data);

                    setCurrentStatus(data.status);
                    setSelectedStatus(data.status);
                } else {
                    console.error("No ID found in params");
                    setOrder(null);
                }
            } catch (err) {
                console.error("Gagal memuat data order:", err);
                setOrder(null);
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchOrder();
    }, [params]);

    // mockup updateStatus
    const handleUpdateStatus = () => {
        if (!selectedStatus) {
            alert("Status yang dipilih tidak valid.");
            return;
        }

        setIsLoading(true);
        console.log(
            "Mengupdate status dari",
            currentStatus,
            "menjadi",
            selectedStatus
        );

        setTimeout(() => {
            setCurrentStatus(selectedStatus);
            setIsLoading(false);
            alert(
                `Status pesanan berhasil diubah menjadi: ${getStatusLabel(
                    selectedStatus
                )}`
            );
        }, 1000);
    };

    // Mockup simulasi download file
    const handleDownload = () => {
        if (!order) return;
        alert(
            `Mulai mengunduh: ${order.documentName}\nDari path: ${order.documentPath}`
        );
    };

    if (isPageLoading || !order) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-lg">Memuat data pesanan...</p>
            </div>
        );
    }

    const payment = order.Payment[0];
    console.log(order);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* === KOLOM UTAMA === */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Card Detail Pesanan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <span>Detail Pesanan</span>
                                <span className="text-sm font-normal text-muted-foreground mt-1 md:mt-0">
                                    ID: {order.id}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem
                                    icon={Calendar}
                                    label="Tanggal Pesan"
                                    value={formatDate(order.orderDate)}
                                />
                                <DetailItem
                                    icon={Hash}
                                    label="Jumlah Halaman"
                                    value={`${order.sheetCount} lembar`}
                                />
                                <DetailItem
                                    icon={Hash}
                                    label="Jenis Kertas"
                                    value={order.paperType}
                                />
                                <DetailItem
                                    icon={Hash}
                                    label="Finishing"
                                    value={order.finishing}
                                />
                                <DetailItem
                                    icon={Hash}
                                    label="Tipe Cetak"
                                    value={order.printType}
                                />
                                <DetailItem
                                    icon={Hash}
                                    label="Kuantitas"
                                    value={`${order.quantity} rangkap`}
                                />
                            </div>
                            <Separator />
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                    Total Harga
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatPrice(order.totalPrice)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card File Dokumen */}
                    <Card>
                        <CardHeader>
                            <CardTitle>File Dokumen</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                                <p className="font-medium break-all">
                                    {order.documentName}
                                </p>
                            </div>
                            <Button
                                onClick={handleDownload}
                                className="w-full sm:w-auto flex-shrink-0"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download File
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* === KOLOM SIDEBAR === */}
                <div className="space-y-6">
                    {/* Card Aksi */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Aksi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">
                                    Status Pesanan Saat Ini
                                </label>
                                <p className="text-lg font-semibold">
                                    {/* Aman untuk diakses karena 'currentStatus' pasti sudah terisi */}
                                    {currentStatus
                                        ? getStatusLabel(currentStatus)
                                        : "Memuat..."}
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="status-select"
                                    className="text-sm font-medium"
                                >
                                    Ubah Status Ke
                                </label>
                                <Select
                                    // 'selectedStatus' bisa jadi null saat awal, jadi kita beri fallback
                                    value={selectedStatus || ""}
                                    onValueChange={(value) =>
                                        setSelectedStatus(
                                            value as OrderProgress
                                        )
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="status-select">
                                        <SelectValue placeholder="Pilih status baru..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleUpdateStatus}
                                disabled={
                                    isLoading ||
                                    selectedStatus === currentStatus
                                }
                                className="w-full"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Perbarui Status
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Card Pelanggan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Pelanggan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DetailItem
                                icon={User}
                                label="Nama"
                                value={order.user.username}
                            />
                            <DetailItem
                                icon={Hash}
                                label="Email"
                                // Perbaikan: Cek jika Auth ada sebelum mengakses email
                                value={
                                    order.email.email ?? "Email tidak tersedia"
                                }
                            />
                            <DetailItem
                                icon={Hash}
                                label="No. HP"
                                value={
                                    order.user.phoneNum || "No. HP tidak ada"
                                }
                            />
                        </CardContent>
                    </Card>

                    {/* Card Pembayaran */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Pembayaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DetailItem
                                icon={Hash}
                                label="Status Pembayaran"
                                value={
                                    <span
                                        className={`font-semibold ${
                                            payment?.transactionStatus ===
                                            "settlement"
                                                ? "text-green-600"
                                                : "text-yellow-600"
                                        }`}
                                    >
                                        {payment?.transactionStatus ??
                                            "Belum Dibayar"}
                                    </span>
                                }
                            />
                            <DetailItem
                                icon={Hash}
                                label="Metode"
                                value={payment?.paymentType ?? "N/A"}
                            />
                            <DetailItem
                                icon={Hash}
                                label="Bank"
                                value={payment?.bank?.toUpperCase() ?? "N/A"}
                            />
                            <DetailItem
                                icon={Hash}
                                label="ID Transaksi"
                                value={payment?.transactionId ?? "N/A"}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
