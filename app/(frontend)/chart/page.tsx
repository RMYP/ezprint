"use client";

import Navbar from "@/components/exNavbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    Trash,
    ShoppingCart,
    FileText,
    Calendar,
    Clock,
    AlertCircle,
    Layers,
    ClipboardList,
    Search, // Ikon baru untuk "Lihat Detail"
} from "lucide-react";
import { getChart } from "../action/action";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Link from "next/link"; // Tetap import Link

// Interface dari file asli
interface PaymentList {
    id: string;
    transactionId: string;
    orderId: string;
    grossAmount: string;
    paymentType: string;
    transactionTime: string;
    expiryTime: string;
    vaNumber: string;
    bank: string;
    transactionStatus: string;
}

interface ChartList {
    id: string;
    sheetCount: number;
    paperType: string;
    finishing: string;
    quantity: number;
    printType: string;
    totalPrice: string;
    status: string;
    paymentStatus: boolean;
    documentPath: string;
    documentName: string;
    userId: string;
    orderDate: string;
    Payment: PaymentList[];
}

// --- Helper Baru ---

// Helper untuk memformat harga
const formatPrice = (price: string | number) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return price.toString();
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(numericPrice);
};

// Helper untuk memformat tanggal
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

// Helper untuk badge status (tanpa loading)
const getStatusBadge = (item: ChartList) => {
    const payment = item.Payment?.[0];

    if (payment) {
        switch (payment.transactionStatus) {
            case "pending":
                return (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Menunggu Pembayaran
                    </span>
                );
            case "cancel":
            case "expire":
                return (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3" />
                        Pembayaran Gagal
                    </span>
                );
        }
    }
    return (
        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Belum Checkout
        </span>
    );
};

// Komponen helper untuk item detail di dalam kartu
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
        <div className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    );
}

// --- Komponen Skeleton Baru ---
const CartItemSkeleton = () => (
    <Card className="overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row">
            {/* Bagian Kiri (Konten) */}
            <div className="p-6 flex-1 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Separator />
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>
            {/* Bagian Kanan (Aksi) */}
            <div className="p-6 sm:w-1/3 flex flex-col justify-between items-start sm:items-end gap-4 bg-gray-50/50 sm:border-l">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-5 w-36" />
                <div className="flex flex-col sm:flex-row-reverse gap-2 w-full sm:w-auto">
                    <Skeleton className="h-10 w-full sm:w-24" />
                    <Skeleton className="h-10 w-full sm:w-32" />
                    <Skeleton className="h-10 w-full sm:w-10" />
                </div>
            </div>
        </div>
    </Card>
);

// --- Halaman Utama ---
export default function Page() {
    const router = useRouter();
    const [chartList, setCartList] = useState<ChartList[] | null>(null);

    useEffect(() => {
        const getChartList = async () => {
            try {
                const data = await getChart(); //
                setCartList(data);
            } catch (err: unknown) {
                console.error(err);
                if (
                    err instanceof Error &&
                    err.message.includes("Invalid Token")
                ) {
                    router.push("/login");
                }
                setCartList([]); // fallback jika API gagal
            }
        };
        getChartList();
    }, [router]);

    // Filter dari file asli Anda: hanya tampilkan item yang belum lunas
    const visibleItems = chartList
        ? chartList.filter((item) => !item.paymentStatus)
        : [];

    // Komponen untuk tombol aksi dinamis
    const GetActionButtons = ({ item }: { item: ChartList }) => {
        const payment = item.Payment?.[0];
        const buttonClassName = "w-full sm:w-auto"; // Class untuk konsistensi

        let mainAction: React.ReactNode;

        if (payment?.transactionStatus === "pending") {
            mainAction = (
                <Button
                    className={buttonClassName}
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                            `/checkout/payment/${payment.transactionId}/${item.id}`
                        );
                    }}
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Bayar
                </Button>
            );
        } else if (
            payment?.transactionStatus === "cancel" ||
            payment?.transactionStatus === "expire"
        ) {
            mainAction = (
                <Button
                    className={buttonClassName}
                    variant="outline"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/checkout/${item.id}`);
                    }}
                >
                    Bayar Ulang
                </Button>
            );
        } else {
            // Default: 'waitingCheckout' atau tidak ada data payment
            mainAction = (
                <Button
                    className={buttonClassName}
                    variant="outline"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/checkout/${item.id}`);
                    }}
                >
                    Checkout
                </Button>
            );
        }

        return (
            // Mobile: tumpuk vertikal. Desktop: baris horizontal (dibalik)
            <div className="flex flex-col sm:flex-row-reverse gap-2 w-full sm:w-auto">
                {/* Tombol Aksi Utama (Paling Kanan) */}
                {mainAction}

                {/* === TOMBOL DETAIL BARU === */}
                <Button
                    variant="outline"
                    className={buttonClassName}
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/status/${item.id}`);
                    }}
                >
                    <Search className="mr-0 sm:mr-2 h-4 w-4" />
                    <span className="sm:inline hidden">Detail</span>
                    <span className="sm:hidden inline">Lihat Detail</span>
                </Button>

                {/* Tombol Hapus (Paling Kiri) */}
                <Button
                    variant="outline"
                    size="icon"
                    className="w-full sm:w-auto text-muted-foreground hover:text-destructive hover:border-destructive"
                    onClick={(e) => {
                        e.stopPropagation();
                        alert("Fungsi Hapus belum diimplementasikan");
                    }}
                >
                    <Trash className="h-4 w-4" />
                    <span className="sm:hidden ml-2">Hapus Item</span>
                </Button>
            </div>
        );
    };

    return (
        <div className="bg-muted/40 min-h-screen">
            <Navbar props={"bg-white"} />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    Keranjang Saya
                </h1>

                {/* --- Kontainer List (Satu Kolom) --- */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* ========================= */}
                    {/* 1. Loading State */}
                    {/* ========================= */}
                    {!chartList ? (
                        <>
                            <CartItemSkeleton />
                            <CartItemSkeleton />
                        </>
                    ) : /* ========================= */
                    /* 2. Empty State */
                    /* ========================= */
                    visibleItems.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-20">
                                <ShoppingCart
                                    size={64}
                                    className="text-gray-400 mb-4"
                                />
                                <h3 className="text-xl font-semibold text-gray-800">
                                    Keranjang Anda Kosong
                                </h3>
                                <p className="text-lg text-gray-500 mt-2">
                                    Ayo, mulai pesan sesuatu!
                                </p>
                                <Button
                                    className="mt-6"
                                    onClick={() => router.push("/orderbeta")}
                                >
                                    Mulai Belanja
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        /* ========================= */
                        /* 3. Data State (List) */
                        /* ========================= */
                        <>
                            {visibleItems.map((item) => (
                                <Card
                                    key={item.id}
                                    className="overflow-hidden shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Bagian Kiri (Konten) */}
                                        <div className="p-6 flex-1 space-y-3">
                                            {/* Link pada nama dokumen */}
                                            <Link
                                                href={`/status/${item.id}`}
                                                className="group"
                                            >
                                                <h3 className="text-xl font-semibold text-gray-900 break-all group-hover:text-primary group-hover:underline">
                                                    {item.documentName}
                                                </h3>
                                            </Link>

                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    Dibuat{" "}
                                                    {formatDate(item.orderDate)}
                                                </span>
                                            </p>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2">
                                                <DetailItem
                                                    icon={Layers}
                                                    label="Kuantitas"
                                                    value={`${item.quantity} pcs`}
                                                />
                                                <DetailItem
                                                    icon={FileText}
                                                    label="Kertas"
                                                    value={item.paperType}
                                                />
                                                <DetailItem
                                                    icon={ClipboardList}
                                                    label="Finishing"
                                                    value={item.finishing}
                                                />
                                            </div>
                                        </div>

                                        {/* Bagian Kanan (Aksi) */}
                                        <div className="p-6 sm:w-[280px] flex flex-col justify-between items-start sm:items-end gap-4 bg-gray-50/50 sm:border-l">
                                            <div className="flex flex-col items-start sm:items-end w-full">
                                                <span className="text-sm text-muted-foreground">
                                                    Total Harga
                                                </span>
                                                <span className="text-2xl font-bold text-primary">
                                                    {formatPrice(
                                                        item.totalPrice
                                                    )}
                                                </span>
                                            </div>
                                            {getStatusBadge(item)}

                                            {/* Komponen Tombol Aksi */}
                                            <GetActionButtons item={item} />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
