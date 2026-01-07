"use client";

import React, { useEffect, useState } from "react";
import {
    Clock,
    Hourglass,
    CheckCircle2,
    AlertCircle,
    CalendarClock,
    Loader2,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Helper Functions (Safe Formatting) ---
const formatTime = (date: Date) => {
    // Validasi pencegah error "Invalid time value"
    if (isNaN(date.getTime())) return "--:--";

    return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
};

const formatDate = (date: Date) => {
    if (isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
    }).format(date);
};

interface QueueCardProps {
    durationMinutes: number;
}

export function QueueStatusCardMock({ durationMinutes }: QueueCardProps) {
    const [machineQueueSeconds, setMachineQueueSeconds] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        const eventSource = new EventSource("/api/v1/sse");
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                const queueSeconds =
                    typeof data.currentMachineQueueTime === "number"
                        ? data.currentMachineQueueTime
                        : 0;

                setMachineQueueSeconds(queueSeconds);
                setIsLoaded(true);
            } catch (err) {
                console.error("Error parsing SSE data", err);
            }
        };

        return () => {
            eventSource.close();
            clearInterval(timer);
        };
    }, []);

    if (!isLoaded) {
        return <QueueCardSkeleton />;
    }

    const startTime = new Date(now.getTime() + machineQueueSeconds * 1000);

    const finishTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const waitingMinutes = Math.ceil(machineQueueSeconds / 60);

    const isQueueBusy = waitingMinutes > 30;

    return (
        <Card
            className={`mb-6 border-2 transition-all duration-500 shadow-sm
            ${
                isQueueBusy
                    ? "border-orange-200 bg-orange-50/40"
                    : "border-blue-200 bg-blue-50/40"
            }`}
        >
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg text-foreground/90">
                            <Clock
                                className={`h-5 w-5 ${
                                    isQueueBusy
                                        ? "text-orange-600"
                                        : "text-blue-600"
                                }`}
                            />
                            Estimasi Pengerjaan
                        </CardTitle>
                        <CardDescription>
                            Status antrean mesin saat ini (Real-time).
                        </CardDescription>
                    </div>

                    {isQueueBusy ? (
                        <Badge
                            variant="destructive"
                            className="animate-pulse bg-orange-500 hover:bg-orange-600"
                        >
                            Antrean Padat
                        </Badge>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                        >
                            Mesin Lengang
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="grid gap-6">
                <div className="relative pl-4 border-l-2 border-dashed border-muted-foreground/20 ml-2 space-y-8 mt-2">
                    {/* TITIK 1: MULAI */}
                    <div className="relative">
                        <div
                            className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full ring-4 ring-background 
                            ${isQueueBusy ? "bg-orange-500" : "bg-blue-500"}`}
                        />

                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Mulai Pengerjaan
                                </p>
                                <p className="font-medium text-sm mt-0.5 text-foreground">
                                    {machineQueueSeconds > 60 // Tampilkan logika jika antrean > 1 menit
                                        ? `Menunggu antrean ~${waitingMinutes} menit`
                                        : "Langsung dikerjakan"}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-foreground">
                                    {formatTime(startTime)}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">
                                    WITA
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* DURASI BADGE */}
                    <div className="absolute top-8 -left-3">
                        <div className="flex items-center gap-1.5 bg-background border shadow-sm px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground">
                            <Hourglass className="h-3 w-3" />
                            <span>
                                +{Math.ceil(durationMinutes)} Menit Proses
                            </span>
                        </div>
                    </div>

                    {/* TITIK 2: SELESAI */}
                    <div className="relative">
                        <div className="absolute -left-[23px] top-1 h-4 w-4 rounded-full bg-foreground ring-4 ring-background flex items-center justify-center">
                            <div className="h-1.5 w-1.5 bg-background rounded-full" />
                        </div>

                        <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg border border-border/50 shadow-sm">
                            <div>
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">
                                    Estimasi Selesai
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarClock className="h-3 w-3" />
                                    {formatDate(finishTime)}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-extrabold text-primary leading-none">
                                    {formatTime(finishTime)}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Siap Diambil
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {isQueueBusy && (
                    <Alert className="bg-orange-100 border-orange-200 text-orange-900 py-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <div className="ml-2">
                            <AlertTitle className="text-xs font-bold">
                                Waktu Mulai Bergerak!
                            </AlertTitle>
                            <AlertDescription className="text-[10px] opacity-90">
                                Antrean mesin bertambah ({machineQueueSeconds}{" "}
                                detik). Bayar sekarang untuk mengamankan jam
                                selesai <b>{formatTime(finishTime)}</b>.
                            </AlertDescription>
                        </div>
                    </Alert>
                )}
            </CardContent>

            <CardFooter className="pt-0 pb-4">
                <div className="w-full flex items-center justify-center gap-2 text-[10px] text-muted-foreground bg-black/5 p-2 rounded border border-black/5">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>
                        Jaminan selesai tepat waktu untuk pembayaran
                        terkonfirmasi.
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
}

function QueueCardSkeleton() {
    return (
        <Card className="mb-6 h-64 flex flex-col justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground mt-2">
                Menyinkronkan antrean...
            </p>
        </Card>
    );
}
