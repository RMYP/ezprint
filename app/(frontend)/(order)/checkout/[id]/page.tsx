"use client";

import Navbar from "@/components/exNavbar";
import {
    getTransaction,
    handleBankCheckout,
} from "@/app/(frontend)/action/action";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, CreditCard, Wallet } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

interface TransactionInterfaceDetail {
    totalSheet: number;
    totalPayment: string;
    paperType: string;
    quantity: number;
    documentName: string;
    username: string;
    phoneNumber: string;
    printType: string;
}

// Komponen Skeleton untuk Ringkasan
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
            <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-28" />
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-32" />
            </div>
        </div>
    );
}

export default function PaymentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [isCheckout, setIsCheckout] = useState(false);
    const [bank, setBank] = useState("");
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
                setTransaction(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransaction();
    }, [params]);

    const onClickBankPayment = async (selectedBank: string) => {
        if (!selectedBank) {
            toast.error("Harap pilih bank terlebih dahulu.");
            return;
        }

        const paymentType =
            selectedBank === "mandiri"
                ? "echannel"
                : selectedBank === "permata"
                ? "permata"
                : "bank_transfer";
        
        try {
            setIsCheckout(true);
            const response = await handleBankCheckout(orderId, selectedBank, paymentType);
            const newLink = `/checkout/payment/${response.transaction_id}/${response.oderId}`;
            router.push(newLink);
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : "Unexpected server error"
            );
        } finally {
            setIsCheckout(false);
        }
    };

    return (
        <div>
            <Navbar props="bg-white" />
            <div className="bg-muted/40 min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    
                    {/* === KOLOM KIRI (Metode Pembayaran) === */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Pelanggan</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Nama</Label>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-40" />
                                    ) : (
                                        <p className="font-semibold text-md">
                                            {transaction?.username || "-"}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>Nomor Telepon</Label>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-32" />
                                    ) : (
                                        <p className="font-semibold text-md">
                                            {transaction?.phoneNumber || "-"}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pilih Metode Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Opsi Bank Transfer */}
                                <div className="border border-border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">
                                            Bank Transfer (Virtual Account)
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-8">
                                        Bayar menggunakan nomor Virtual Account dari berbagai bank.
                                    </p>
                                    <div className="ml-8 pt-2">
                                        <Label htmlFor="bank-select">Pilih Bank</Label>
                                        <Select
                                            value={bank}
                                            onValueChange={setBank}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger id="bank-select">
                                                <SelectValue placeholder="Pilih bank Anda" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="bca">BCA</SelectItem>
                                                    <SelectItem value="bri">BRI</SelectItem>
                                                    <SelectItem value="bni">BNI</SelectItem>
                                                    <SelectItem value="permata">Permata</SelectItem>
                                                    <SelectItem value="cimb">CIMB</SelectItem>
                                                    <SelectItem value="mandiri">Mandiri</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Opsi E-Wallet (Disabled) */}
                                <div className="border border-border rounded-lg p-4 space-y-3 opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-3">
                                        <Wallet className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-semibold text-muted-foreground">
                                            E-Wallet (Coming Soon)
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground ml-8">
                                        Pembayaran via QRIS, GoPay, dan lainnya akan segera hadir.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* === KOLOM KANAN (Ringkasan) === */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Ringkasan Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading || !transaction ? (
                                    <SummarySkeleton />
                                ) : (
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Dokumen</span>
                                            <span className="font-medium text-right break-all max-w-[60%]">
                                                {transaction.documentName}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Halaman</span>
                                            <span className="font-medium">
                                                {transaction.totalSheet} lbr
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Jenis Kertas</span>
                                            <span className="font-medium">
                                                {transaction.paperType}
                                            </span>
                                        </div>
                                        {/* <div className="flex justify-between">
                                            <span className="text-muted-foreground">Finishing</span>
                                            <span className="font-medium">
                                                {transaction.finishing}
                                            </span>
                                        </div> */}
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tipe Cetak</span>
                                            <span className="font-medium">
                                                {transaction.printType}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Kuantitas</span>
                                            <span className="font-medium">
                                                {transaction.quantity}x
                                            </span>
                                        </div>
                                        <Separator className="my-4" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold">Total Harga</span>
                                            <span className="text-2xl font-bold text-primary">
                                                {transaction.totalPayment}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full text-lg py-6"
                                    onClick={() => onClickBankPayment(bank)}
                                    disabled={!bank || isCheckout || isLoading}
                                >
                                    {isCheckout ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        "Bayar Sekarang"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}