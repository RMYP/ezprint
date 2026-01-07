"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/exNavbar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
    ShoppingBag,
    Store,
    Clock,
    Printer,
    PackageCheck,
    CheckCircle2,
    MapPin,
    Loader2,
    FileText,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";

type OrderProgress =
    | "waitingCheckout"
    | "waitingPayment"
    | "confirmOrder"
    | "onProgress"
    | "deny"
    | "finished"
    | "readyToPickUp";

interface PaymentData {
    transactionStatus: string;
    paymentType: string;
    vaNumber?: string;
}

interface OrderData {
    id: string;
    invoiceNumber?: string; // Jika tidak ada di DB, kita generate dummy atau pakai ID
    status: OrderProgress;
    totalPrice: number;
    documentName: string;
    documentPath: string;
    paperType?: string;
    finishing?: string;
    printType?: string;
    inkType?: string;
    quantity?: number;
    sheetCount?: number;
    orderDate: string; // Tanggal dari API biasanya string ISO
    notes?: string;
    Payment: PaymentData[];
}

export default function TransactionPage() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("waitingPayment");

    // --- FETCH DATA DARI API ---
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/v1/order/get-all");
                const response = await res.json();

                if (response.success && Array.isArray(response.data)) {
                    setOrders(response.data);
                } else {
                    console.error(
                        "Gagal mengambil data pesanan:",
                        response.message
                    );
                    // toast.error("Gagal memuat riwayat pesanan");
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // --- FORMATTER ---
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd MMMM yyyy", {
            locale: idLocale,
        });
    };

    // Helper untuk membuat string Varian Produk
    const getVariantString = (order: OrderData) => {
        const parts = [
            order.paperType,
            order.inkType,
            order.finishing,
            order.printType,
        ].filter(Boolean); // Hapus yang null/undefined

        return parts.length > 0 ? parts.join(", ") : "Standard";
    };

    // --- LOGIC FILTERING BERDASARKAN STATUS PRISMA ---
    const getFilteredOrders = (tabValue: string) => {
        return orders.filter((order) => {
            // Normalisasi status ke lowercase untuk comparison aman
            const status = order.status;

            switch (tabValue) {
                case "waitingPayment":
                    // Tab Belum Bayar
                    return (
                        status === "waitingPayment" ||
                        status === "waitingCheckout"
                    );

                case "processing":
                    // Tab Diproses (Konfirmasi & Sedang Dikerjakan)
                    return status === "confirmOrder" || status === "onProgress";

                case "ready":
                    // Tab Siap Diambil
                    return status === "readyToPickUp";

                case "finished":
                    // Tab Selesai (Termasuk Deny/Cancel untuk history)
                    return status === "finished" || status === "deny";

                default:
                    return true;
            }
        });
    };

    // --- UI DISPLAY HELPER ---
    const getStatusDisplay = (status: OrderProgress) => {
        switch (status) {
            case "waitingPayment":
                return {
                    label: "Belum Bayar",
                    color: "text-slate-500",
                    icon: <Clock className="w-4 h-4" />,
                };
            case "waitingCheckout":
                return {
                    label: "Belum Bayar",
                    color: "text-slate-500",
                    icon: <Clock className="w-4 h-4" />,
                };
            case "confirmOrder":
                return {
                    label: "Menunggu Konfirmasi",
                    color: "text-blue-600",
                    icon: <Clock className="w-4 h-4" />,
                };
            case "onProgress":
                return {
                    label: "Sedang Dicetak",
                    color: "text-blue-600",
                    icon: <Printer className="w-4 h-4" />,
                };
            case "readyToPickUp":
                return {
                    label: "Siap Diambil",
                    color: "text-emerald-600",
                    icon: <PackageCheck className="w-4 h-4" />,
                };
            case "finished":
                return {
                    label: "Selesai",
                    color: "text-green-600",
                    icon: <CheckCircle2 className="w-4 h-4" />,
                };
            case "deny":
                return {
                    label: "Ditolak/Batal",
                    color: "text-red-500",
                    icon: <Store className="w-4 h-4" />,
                };
            default:
                return { label: status, color: "text-gray-500", icon: null };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            <Navbar props={"bg-white"} />
            <div className="max-w-4xl mx-auto pt-6 px-0 md:px-4">
                {/* --- HEADER TABS (Sticky) --- */}
                <div className="sticky top-0 z-20 bg-white shadow-sm">
                    <Tabs
                        defaultValue="waitingPayment"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="w-full flex justify-between h-auto p-0 bg-white rounded-none border-b border-gray-200 overflow-x-auto">
                            <TabsTrigger
                                value="waitingPayment"
                                className="flex-1 min-w-[90px] py-4 text-sm font-medium text-gray-600 data-[state=active]:text-slate-600 data-[state=active]:border-b-2 data-[state=active]:border-slate-600 data-[state=active]:shadow-none rounded-none transition-all"
                            >
                                Belum Bayar
                            </TabsTrigger>

                            <TabsTrigger
                                value="processing"
                                className="flex-1 min-w-[90px] py-4 text-sm font-medium text-gray-600 data-[state=active]:text-slate-600 data-[state=active]:border-b-2 data-[state=active]:border-slate-600 data-[state=active]:shadow-none rounded-none transition-all"
                            >
                                Diproses
                            </TabsTrigger>

                            <TabsTrigger
                                value="ready"
                                className="flex-1 min-w-[90px] py-4 text-sm font-medium text-gray-600 data-[state=active]:text-slate-600 data-[state=active]:border-b-2 data-[state=active]:border-slate-600 data-[state=active]:shadow-none rounded-none transition-all"
                            >
                                Siap Diambil
                            </TabsTrigger>

                            <TabsTrigger
                                value="finished"
                                className="flex-1 min-w-[90px] py-4 text-sm font-medium text-gray-600 data-[state=active]:text-slate-600 data-[state=active]:border-b-2 data-[state=active]:border-slate-600 data-[state=active]:shadow-none rounded-none transition-all"
                            >
                                Selesai
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="mt-4 px-4 md:px-0 space-y-4">
                    {getFilteredOrders(activeTab).length === 0 ? (
                        // EMPTY STATE
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
                            <div className="bg-gray-50 p-6 rounded-full mb-4">
                                <ShoppingBag className="w-16 h-16 text-gray-300" />
                            </div>
                            <p className="text-gray-500">
                                Tidak ada pesanan di status ini
                            </p>
                        </div>
                    ) : (
                        // ORDER LIST
                        getFilteredOrders(activeTab).map((order) => {
                            const statusInfo = getStatusDisplay(order.status);

                            return (
                                <Card
                                    key={order.id}
                                    className="border-none shadow-sm overflow-hidden bg-white rounded-none md:rounded-lg mb-4"
                                >
                                    {/* Card Header */}
                                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4 text-gray-800 hidden lg:block" />
                                            <span className="font-semibold text-sm hidden lg:block">
                                                PrintKampus
                                            </span>
                                            <span className="text-xs text-gray-400 mx-1 hidden lg:block">
                                                |
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(order.orderDate)}
                                            </span>
                                        </div>
                                        <div
                                            className={`flex items-center gap-1 text-sm font-medium ${statusInfo.color} uppercase`}
                                        >
                                            {statusInfo.icon}
                                            <span>{statusInfo.label}</span>
                                        </div>
                                    </div>

                                    {/* Card Items */}
                                    <div className="divide-y divide-gray-50">
                                        <div className="p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                            {/* File Icon / Image */}
                                            <div className="relative w-16 h-16 flex-shrink-0 bg-slate-50 rounded border border-slate-100 flex items-center justify-center">
                                                <FileText className="text-slate-400 w-8 h-8" />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {order.documentName}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {getVariantString(order)}
                                                </p>
                                                {order.notes && (
                                                    <p className="text-[10px] text-gray-400 italic mt-1">
                                                        Catatan: {order.notes}
                                                    </p>
                                                )}
                                                <div className="flex justify-between items-end mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {order.quantity
                                                            ? `x${order.quantity}`
                                                            : `x1`}
                                                    </span>
                                                    <span className="text-sm text-gray-800 font-medium">
                                                        {formatRupiah(
                                                            order.totalPrice ||
                                                                0
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer (Actions) */}
                                    <div className="border-t border-gray-100 p-4 bg-white">
                                        {/* Pesan Khusus Jika Siap Diambil */}
                                        {order.status === "readyToPickUp" && (
                                            <div className="mb-4 bg-emerald-50 border border-emerald-100 p-3 rounded-md flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-emerald-800 font-semibold">
                                                        Pesanan Siap Diambil!
                                                    </p>
                                                    <p className="text-xs text-emerald-600 mt-1">
                                                        Silakan ambil di konter
                                                        PrintKampus. Tunjukkan
                                                        ID Pesanan:{" "}
                                                        <span className="font-mono font-bold bg-white px-1 rounded ml-1 text-black">
                                                            {order.id
                                                                .slice(-6)
                                                                .toUpperCase()}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                                            <div className="text-sm">
                                                <span className="text-gray-500">
                                                    Total Pesanan:{" "}
                                                </span>
                                                <span className="text-lg font-bold text-slate-600">
                                                    {formatRupiah(
                                                        order.totalPrice || 0
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto">
                                                {order.status ===
                                                    "waitingPayment" && (
                                                    <Button
                                                        className="flex-1 md:flex-none bg-slate-500 hover:bg-slate-600 text-white shadow-sm"
                                                        onClick={() =>
                                                            (window.location.href = `/checkout/${order.id}`)
                                                        } // Arahkan ke halaman bayar
                                                    >
                                                        Bayar Sekarang
                                                    </Button>
                                                )}

                                                {(order.status ===
                                                    "confirmOrder" ||
                                                    order.status ===
                                                        "onProgress") && (
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 md:flex-none border-gray-300 text-gray-600"
                                                        disabled
                                                    >
                                                        Menunggu Diproses
                                                    </Button>
                                                )}

                                                {order.status ===
                                                    "finished" && (
                                                    <Button className="flex-1 md:flex-none bg-slate-500 hover:bg-slate-600 text-white">
                                                        Pesan Lagi
                                                    </Button>
                                                )}

                                                {/* Tombol Umum */}
                                                <Button
                                                    variant="secondary"
                                                    className="flex-1 md:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                    onClick={() =>
                                                        (window.location.href = `/status/${order.id}`)
                                                    }
                                                >
                                                    Rincian
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
