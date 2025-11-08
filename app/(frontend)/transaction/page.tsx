"use client";

import Navbar from "@/components/exNavbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Masih dipakai untuk empty state
import {
    ShoppingCart,
    Calendar,
    Package, // Ikon statis untuk "sedang diproses"
    ChevronRight, // Ikon untuk indikator klik
} from "lucide-react";
import { getAllTransaction } from "../action/action";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
const formatPrice = (price: string) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return price;
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

// --- Komponen Skeleton Baru ---
const TransactionSkeleton = () => (
    <div className="flex items-center justify-between p-5 border-b border-gray-200">
        <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
            </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-16" />
        </div>
    </div>
);

export default function Page() {
    const router = useRouter();
    const [chartList, setCartList] = useState<ChartList[] | null>(null);

    useEffect(() => {
        const getChartList = async () => {
            try {
                const data = await getAllTransaction(); //
                setCartList(data);
            } catch (err: unknown) {
                console.error(err);
                setCartList([]);
            }
        };
        getChartList();
    }, []);

    // API Anda untuk rute ini hanya mengembalikan pesanan "onProgress"
    //
    const visibleItems = chartList || [];

    return (
        <div className="bg-muted/40 min-h-screen">
            <Navbar props={"bg-white"} />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    Pesanan Aktif
                </h1>

                {/* --- Kontainer List (Pengganti Kartu) --- */}
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* ========================= */}
                    {/* 1. Loading State */}
                    {/* ========================= */}
                    {!chartList ? (
                        <div className="divide-y divide-gray-200">
                            <TransactionSkeleton />
                            <TransactionSkeleton />
                            <TransactionSkeleton />
                        </div>
                    ) : /* ========================= */
                    /* 2. Empty State */
                    /* ========================= */
                    visibleItems.length === 0 ? (
                        <Card className="shadow-none border-none">
                            <CardContent className="flex flex-col items-center justify-center py-20">
                                <Package
                                    size={64}
                                    className="text-gray-400 mb-4"
                                />
                                <h3 className="text-xl font-semibold text-gray-800">
                                    Tidak Ada Pesanan Aktif
                                </h3>
                                <p className="text-lg text-gray-500 mt-2">
                                    Semua pesanan Anda sudah selesai atau belum
                                    ada pesanan baru.
                                </p>
                                <Button
                                    className="mt-6"
                                    onClick={() => router.push("/order")}
                                >
                                    Buat Pesanan Baru
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        /* ========================= */
                        /* 3. Data State (List) */
                        /* ========================= */
                        <div className="divide-y divide-gray-200">
                            {visibleItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-5 gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                    onClick={() =>
                                        router.push(`/status/${item.id}`)
                                    }
                                >
                                    {/* Bagian Kiri: Ikon & Detail */}
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Package className="h-6 w-6 text-blue-700" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h3 className="text-lg font-semibold text-gray-900 break-all">
                                                {item.documentName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {formatDate(item.orderDate)}
                                                </span>
                                            </p>
                                            {/* Detail Pengisi Ruang Kosong */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-sm text-gray-700">
                                                <span className="font-medium">
                                                    {item.quantity} pcs
                                                </span>
                                                <span className="hidden md:inline text-gray-400">
                                                    |
                                                </span>
                                                <span>{item.paperType}</span>
                                                <span className="hidden md:inline text-gray-400">
                                                    |
                                                </span>
                                                <span>{item.finishing}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bagian Kanan: Harga & Indikator */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <span className="text-lg font-bold text-gray-900 text-right">
                                            {formatPrice(item.totalPrice)}
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
