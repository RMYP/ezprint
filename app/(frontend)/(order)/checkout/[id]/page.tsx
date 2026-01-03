"use client";

import Navbar from "@/components/exNavbar";
import {
    getCheckPaymentStatus,
    getTransaction,
} from "@/app/(frontend)/action/action";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { QueueStatusCardMock } from "@/components/checkout-queue-card";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionInterfaceDetail {
    totalSheet: number;
    totalPayment: string;
    paperType: string;
    quantity: number;
    documentName: string;
    username: string;
    phoneNumber: string;
    printType: string;
    durationMinutes: number;
}

// Komponen Skeleton untuk loading
function SummarySkeleton() {
    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-32" />
            </div>
        </div>
    );
}

export default function CheckoutPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const router = useRouter();
    const [transaction, setTransaction] =
        useState<TransactionInterfaceDetail | null>(null);
    const [orderId, setOrderId] = useState("");

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const { id } = await params;
                setOrderId(id);
                if (id) {
                    const data = await getTransaction(id);
                    setTransaction(data);
                }
            } catch (err) {
                console.error(err);
                toast.error("Gagal memuat detail transaksi.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransaction();
    }, [params]);

    const handlePay = async () => {
        setIsPaymentLoading(true);
        const toastId = toast.loading("Memproses pembayaran...");

        try {
            const response = await axios.post(
                "/api/v1/payment/new/snap",
                { id: orderId },
                { withCredentials: true }
            );

            toast.dismiss(toastId);
            if (response.data.success) {
                if ((window as any).snap) {
                    (window as any).snap.pay(response.data.data.token, {
                        onSuccess: async function (result: any) {
                            console.log("Payment success", result);
                            const toastId = toast.loading(
                                "Memverifikasi pembayaran..."
                            );
                            try {
                                await getCheckPaymentStatus(
                                    response.data.data.transactionId
                                );
                                toast.dismiss(toastId);
                                toast.success("Pembayaran Terverifikasi!");
                                router.push(`/status/${orderId}`);
                            } catch (err) {
                                console.error(err);
                                toast.dismiss(toastId);
                                toast.error(
                                    "Gagal verifikasi otomatis, silakan cek status pesanan."
                                );
                                router.push(`/status/${orderId}`);
                            }
                        },
                        onPending: function (result: any) {
                            console.log("Payment pending", result);
                            toast("Menunggu pembayaran...", { icon: "⏳" });
                            router.push(`/status/${orderId}`);
                        },
                        onError: function (result: any) {
                            console.error("Payment error", result);
                            toast.error("Pembayaran Gagal!");
                        },
                        onClose: function () {
                            console.log(
                                "Customer closed the popup without finishing the payment"
                            );
                            toast("Anda menutup pembayaran sebelum selesai.", {
                                icon: "⚠️",
                            });
                        },
                    });
                } else {
                    toast.error(
                        "Gagal memuat sistem pembayaran (Snap not found). Refresh halaman."
                    );
                }
            } else {
                toast.error(
                    response.data.message || "Gagal membuat transaksi."
                );
            }
        } catch (error: any) {
            console.error("Checkout Error:", error);
            toast.dismiss(toastId);
            toast.error(
                error.response?.data?.message ||
                    "Terjadi kesalahan saat memproses pembayaran."
            );
        } finally {
            setIsPaymentLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/40">
            <Navbar props="bg-white shadow-sm" />

            <main className="container max-w-6xl mx-auto p-4 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                    Checkout Pesanan
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* === KOLOM KIRI: Detail Customer & Info === */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Kartu Detail Pelanggan */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Pemesan</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">
                                        Nama
                                    </Label>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-3/4 mt-1" />
                                    ) : (
                                        <p className="font-medium text-lg">
                                            {transaction?.username}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">
                                        Nomor Telepon
                                    </Label>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-1/2 mt-1" />
                                    ) : (
                                        <p className="font-medium text-lg">
                                            {transaction?.phoneNumber || "-"}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <QueueStatusCardMock
                            durationMinutes={
                                transaction?.durationMinutes
                                    ? transaction?.durationMinutes
                                    : 30
                            }
                        />
                        {/* Kartu Informasi Pembayaran Aman */}
                        <Card className="bg-blue-50/50 border-blue-100">
                            <CardContent className="flex items-center gap-4 p-4 md:p-6">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900">
                                        Pembayaran Aman & Mudah
                                    </h3>
                                    <p className="text-sm text-blue-700/80 mt-1">
                                        Pilih metode pembayaran favorit Anda
                                        (Transfer Bank, E-Wallet, QRIS, dll) di
                                        langkah selanjutnya.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* === KOLOM KANAN: Ringkasan & Tombol Bayar === */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-md border-t-4 border-t-primary">
                            <CardHeader className="pb-4">
                                <CardTitle>Ringkasan Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <SummarySkeleton />
                                ) : (
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground shrink-0">
                                                Dokumen
                                            </span>
                                            <span className="font-medium text-right break-all">
                                                {transaction?.documentName}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Spesifikasi
                                            </span>
                                            <span className="font-medium text-right">
                                                {transaction?.paperType},{" "}
                                                {transaction?.printType}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Qty
                                            </span>
                                            <span className="font-medium">
                                                {transaction?.totalSheet} lbr x{" "}
                                                {transaction?.quantity}
                                            </span>
                                        </div>

                                        {transaction?.totalPayment &&
                                            (parseInt(
                                                transaction.totalPayment.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            ) < 50000 ? (
                                                <Alert className="mb-4">
                                                    <AlertTitle className="flex items-center justify-center">
                                                        Pesanan &lt; Rp50.000
                                                        kena admin Rp2.500
                                                    </AlertTitle>
                                                </Alert>
                                            ) : null)}
                                        <Separator className="my-4" />

                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-lg font-semibold">
                                                Total Tagihan
                                            </span>
                                            <span className="text-2xl font-bold text-primary">
                                                {transaction?.totalPayment}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-2 pb-6">
                                <Button
                                    className="w-full text-lg h-12"
                                    onClick={handlePay}
                                    disabled={isLoading || isPaymentLoading}
                                >
                                    {isPaymentLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Memuat...
                                        </>
                                    ) : (
                                        "Pilih Pembayaran"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
