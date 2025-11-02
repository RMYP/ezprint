"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Navbar from "@/components/exNavbar";
import {
    CheckCircle,
    Circle,
    Loader2,
    MapPinned,
    Home,
    ShoppingCart,
    XCircle,
    FileText,
    Calendar,
    Hash,
    Printer,
    Package,
    ClipboardList,
} from "lucide-react";
import { getChartById } from "../../../action/action";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";

// Daftar tahapan pesanan
const stages = [
    { name: "Belum Checkout", status: "waitingCheckout" },
    { name: "Menunggu Pembayaran", status: "waitingPayment" },
    { name: "Pesanan Diterima", status: "confirmOrder" },
    { name: "Pesanan Diproses", status: "onProgress" },
    { name: "Pesanan Siap Diambil", status: "finished" },
];

// Interface untuk data transaksi
interface TransactionData {
    id: string; // Tambahkan ID untuk tombol "Bayar"
    sheetCount: number;
    paperType: string;
    finishing: string;
    quantity: number;
    printType: string;
    totalPrice: number;
    status: string;
    paymentStatus: boolean;
    documentPath: string;
    documentName: string;
    userId: string;
    orderDate: string; // Ini sudah diformat sebagai string oleh useEffect Anda
}

// Komponen helper untuk menampilkan detail
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
            <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-md font-medium break-words">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}

// Helper untuk format harga
const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "N/A";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
};

// Komponen Skeleton untuk halaman
function PageSkeleton() {
    return (
        <div>
            <Navbar props="bg-white mb-5" />
            <div className="bg-muted/40 min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Skeleton untuk Tracker */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-4 w-3/4 mt-1" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </CardContent>
                        </Card>
                        {/* Skeleton untuk Detail */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/2" />
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    {/* Skeleton untuk Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-12 w-full" />
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrderProgressPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [transactionData, setTransactionData] =
        useState<TransactionData | null>(null);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            try {
                setIsLoading(true);
                const { id } = await params;
                const data = await getChartById(id);

                // Format tanggal
                const date = new Date(data.orderDate);
                const newDate = date
                    .toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Asia/Makassar",
                    })
                    .replace(/\//g, "-");
                data.orderDate = newDate;

                setTransactionData(data);

                // Mapping status ke index
                const statusMap: Record<string, number> = {
                    waitingCheckout: 0,
                    waitingPayment: 1,
                    confirmOrder: 2,
                    onProgress: 3,
                    finished: 4,
                    deny: -1, // Status khusus untuk ditolak
                };

                if (data?.status in statusMap) {
                    setCurrentStageIndex(statusMap[data.status]);
                }
            } catch (err) {
                console.error("Error fetching transaction data:", err);
                toast.error("Gagal memuat data pesanan.");
            } finally {
                setIsLoading(false);
            }
        };
        getData();
    }, [params]);

    if (isLoading) {
        return <PageSkeleton />;
    }

    if (!transactionData) {
        return (
            <div>
                <Navbar props="bg-white mb-5" />
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <XCircle className="h-16 w-16 text-destructive" />
                    <h2 className="mt-4 text-2xl font-semibold">
                        Pesanan Tidak Ditemukan
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Data untuk pesanan ini tidak dapat dimuat.
                    </p>
                    <Button
                        className="mt-6"
                        onClick={() => router.push("/home")}
                    >
                        Kembali ke Home
                    </Button>
                </div>
            </div>
        );
    }

    // Mendapatkan URL checkout
    const checkoutUrl =
        currentStageIndex === 0 // Jika status "Belum Checkout"
            ? `/checkout/${transactionData.id}`
            : `/checkout/payment/manual/${transactionData.id}`; // Perlu disesuaikan jika Anda punya transactionId

    return (
        <div>
            <Navbar props="bg-white mb-5" />
            <div className="bg-muted/40 min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* === KOLOM KIRI === */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* --- Card 1: Progress Tracker --- */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Pesanan</CardTitle>
                                <CardDescription>
                                    Lacak progres pesanan Anda di sini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {currentStageIndex === -1 ? (
                                    // Status DITOLAK
                                    <div className="flex items-center gap-4 p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                                        <XCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-destructive">
                                                Pesanan Ditolak
                                            </h3>
                                            <p className="text-sm text-destructive/80">
                                                Maaf, pesanan Anda tidak dapat
                                                kami proses. Silakan hubungi
                                                admin untuk info lebih lanjut.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    // Status Normal
                                    <div className="flex flex-col space-y-6">
                                        {stages.map((stage, index) => {
                                            const isActive =
                                                index === currentStageIndex;
                                            const isCompleted =
                                                index < currentStageIndex;

                                            return (
                                                <div
                                                    key={stage.status}
                                                    className="flex items-center gap-4"
                                                >
                                                    <div>
                                                        {isCompleted ? (
                                                            <CheckCircle className="h-7 w-7 text-green-600" />
                                                        ) : isActive ? (
                                                            <Loader2 className="h-7 w-7 text-yellow-500 animate-spin" />
                                                        ) : (
                                                            <Circle className="h-7 w-7 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p
                                                            className={cn(
                                                                "text-lg font-medium",
                                                                isCompleted &&
                                                                    "text-gray-900",
                                                                isActive &&
                                                                    "text-yellow-600",
                                                                !isCompleted &&
                                                                    !isActive &&
                                                                    "text-gray-400"
                                                            )}
                                                        >
                                                            {stage.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* --- Card 2: Detail Pesanan --- */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <DetailItem
                                    icon={FileText}
                                    label="Nama Dokumen"
                                    value={transactionData.documentName}
                                />
                                <DetailItem
                                    icon={Calendar}
                                    label="Tanggal Pesan"
                                    value={transactionData.orderDate}
                                />
                                <DetailItem
                                    icon={ClipboardList}
                                    label="Jumlah Halaman"
                                    value={`${transactionData.sheetCount} lembar`}
                                />
                                <DetailItem
                                    icon={Package}
                                    label="Jenis Kertas"
                                    value={transactionData.paperType}
                                />
                                <DetailItem
                                    icon={Printer}
                                    label="Tipe Cetak"
                                    value={transactionData.printType}
                                />
                                <DetailItem
                                    icon={Package}
                                    label="Finishing"
                                    value={transactionData.finishing}
                                />
                                <DetailItem
                                    icon={Hash}
                                    label="Kuantitas"
                                    value={`${transactionData.quantity} pcs`}
                                />
                            </CardContent>
                        </Card>

                        {/* --- Card 3: Lokasi Pengambilan --- */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Pengambilan</CardTitle>
                            </CardHeader>
                            <CardContent className="bg-gray-100 p-4 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    Pesanan dapat diambil di{" "}
                                    <span className="font-semibold text-gray-900">
                                        Toko EzPrint
                                    </span>
                                </p>
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="bg-primary p-2 rounded-full text-primary-foreground">
                                        <MapPinned className="w-5 h-5" />
                                    </div>
                                    <p className="text-gray-800 text-sm">
                                        Jl. Perjuangan, gg. Alam Segar 2 No.2,
                                        Sempaja Sel., Kec. Samarinda Utara, Kota
                                        Samarinda, Kalimantan Timur
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* === KOLOM KANAN (Ringkasan & Aksi) === */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Ringkasan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        Status Pembayaran
                                    </span>
                                    {transactionData.paymentStatus ? (
                                        <span className="font-semibold text-green-600 px-3 py-1 bg-green-100 rounded-full text-sm">
                                            Lunas
                                        </span>
                                    ) : (
                                        <span className="font-semibold text-red-600 px-3 py-1 bg-red-100 rounded-full text-sm">
                                            Belum Dibayar
                                        </span>
                                    )}
                                </div>

                                <Separator />

                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-semibold">
                                        Total Harga
                                    </span>
                                    <span className="text-2xl font-bold text-primary">
                                        {formatPrice(
                                            transactionData.totalPrice
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                {/* Tombol Bayar Sekarang (jika belum lunas & tidak ditolak) */}
                                {!transactionData.paymentStatus &&
                                    currentStageIndex !== -1 && (
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={() =>
                                                router.push(checkoutUrl)
                                            }
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Lanjutkan Pembayaran
                                        </Button>
                                    )}

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push("/home")}
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Kembali ke Home
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
