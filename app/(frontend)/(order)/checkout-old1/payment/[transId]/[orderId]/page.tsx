"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/exNavbar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { usePaymentInstruction } from "@/hooks/how-to-pay.store";
import {
    getVaNumber,
    getCheckPaymentStatus,
} from "@/app/(frontend)/action/action";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Banknote, Clock, CreditCard, Loader2 } from "lucide-react";

interface VirtualAccountNumber {
    vaNumber: string;
    bank: string;
    expiryTime: string;
    totalPayment: string;
    transactionId: string;
}

interface SSEStatus {
    message: string;
    status: boolean;
}

function DetailItem({
    icon: Icon,
    label,
    value,
    className = "",
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    className?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-md font-semibold ${className}`}>
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}

function PaymentDetailsSkeleton() {
    return (
        <div className="space-y-4">
            <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-48 mt-2" />
            </div>
            <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32 mt-2" />
            </div>
            <Separator />
            <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-40 mt-2" />
            </div>
            <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-44 mt-2" />
            </div>
        </div>
    );
}

function PaymentInstructionsSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

export default function Page({
    params,
}: {
    params: Promise<{ transId: string; orderId: string }>;
}) {
    const router = useRouter();
    const [notification, setNotification] = useState<SSEStatus | null>(null);
    const [orderingId, setOrderingId] = useState("");
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    const getPaymentInstruction = usePaymentInstruction(
        (state) => state.getPaymentInstruction
    );
    const neededPaymentInstruction = usePaymentInstruction(
        (state) => state.neededPaymentInstruction
    );
    const [virtualAccountNumber, setVirtualAccountNumber] =
        useState<VirtualAccountNumber | null>(null);

    useEffect(() => {
        const getParams = async () => {
            try {
                const { transId, orderId } = await params;
                setOrderingId(orderId);
                const data = await getVaNumber(orderId, transId);
                setVirtualAccountNumber(data);
                getPaymentInstruction(data.bank);
            } catch (error) {
                console.error("Error getting params:", error);
            }
        };
        getParams();

        const eventSource = new EventSource("/api/v1/sse");

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setNotification(data);
        };

        eventSource.onerror = () => {
            setTimeout(() => {
                const newEventSource = new EventSource("/api/v1/sse");
                newEventSource.onmessage = eventSource.onmessage;
            }, 5000);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [params, getPaymentInstruction]);

    useEffect(() => {
        if (notification?.status) {
            // Jika pembayaran berhasil, arahkan ke halaman status
            router.push(`/status/${orderingId}`);
        }
    }, [notification, orderingId, router]);

    const getTransactionStatus = async () => {
        setIsCheckingStatus(true);
        try {
            if (virtualAccountNumber && virtualAccountNumber.transactionId) {
                const isPaymentSuccess = await getCheckPaymentStatus(
                    virtualAccountNumber?.transactionId
                );

                if (isPaymentSuccess) {
                    router.push(`/status/${orderingId}`);
                } else {
                    toast.error("Pembayaran masih tertunda.");
                }
            }
        } catch (err: unknown) {
            console.log(err);
            toast.error(
                err instanceof Error ? err.message : "Gagal mengecek status"
            );
        } finally {
            setIsCheckingStatus(false);
        }
    };

    return (
        <div>
            <Navbar props={"bg-white mb-5"} />
            <div className="bg-muted/40 min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* === KOLOM KIRI (Cara Pembayaran) === */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cara Pembayaran</CardTitle>
                                <CardDescription>
                                    Selesaikan pembayaran Anda melalui salah
                                    satu metode berikut untuk{" "}
                                    <span className="font-semibold text-primary">
                                        {virtualAccountNumber?.bank.toUpperCase()}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {neededPaymentInstruction ? (
                                    <Accordion
                                        type="single"
                                        collapsible
                                        className="w-full"
                                    >
                                        {neededPaymentInstruction.methods.map(
                                            (item, index) => (
                                                <AccordionItem
                                                    key={index}
                                                    value={`item-${index}`}
                                                >
                                                    <AccordionTrigger>
                                                        <p className="text-md font-medium">
                                                            {item.type}
                                                        </p>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="space-y-2 ps-3">
                                                        {item.steps.map(
                                                            (
                                                                step,
                                                                stepIndex
                                                            ) => (
                                                                <p
                                                                    key={
                                                                        stepIndex
                                                                    }
                                                                    className="text-muted-foreground"
                                                                >
                                                                    {stepIndex +
                                                                        1}
                                                                    . {step}
                                                                </p>
                                                            )
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )
                                        )}
                                    </Accordion>
                                ) : (
                                    <PaymentInstructionsSkeleton />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* === KOLOM KANAN (Detail Pembayaran) === */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Selesaikan Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!virtualAccountNumber ? (
                                    <PaymentDetailsSkeleton />
                                ) : (
                                    <div className="space-y-5">
                                        <DetailItem
                                            icon={Clock}
                                            label="Batas Waktu Pembayaran"
                                            value={
                                                virtualAccountNumber.expiryTime
                                            }
                                            className="text-red-600 text-lg"
                                        />
                                        <DetailItem
                                            icon={Banknote}
                                            label="Total Pembayaran"
                                            value={
                                                virtualAccountNumber.totalPayment
                                            }
                                            className="text-primary text-xl"
                                        />
                                        <Separator />
                                        <DetailItem
                                            icon={CreditCard}
                                            label="Bank"
                                            value={`${virtualAccountNumber.bank.toUpperCase()} Virtual Account`}
                                        />
                                        <DetailItem
                                            icon={CreditCard}
                                            label="Nomor Virtual Account"
                                            value={
                                                virtualAccountNumber.vaNumber
                                            }
                                            className="text-lg"
                                        />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={getTransactionStatus}
                                    disabled={isCheckingStatus}
                                >
                                    {isCheckingStatus ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Cek Status Pembayaran
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
