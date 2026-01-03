import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarCheck, Clock } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface PickupScheduleCardProps {
    readyAt: Date | null;
}

export function PickupScheduleCard({ readyAt }: PickupScheduleCardProps) {
    if (!readyAt) {
        return (
            <Card className="border-dashed border-2 bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center opacity-60">
                    <Clock className="h-10 w-10 mb-3 text-muted-foreground" />
                    <p className="font-medium">
                        Waktu pengambilan belum tersedia
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Jadwal akan muncul setelah pembayaran dikonfirmasi.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const dateObj = new Date(readyAt);

    return (
        <Card className="overflow-hidden border-green-200 bg-green-50/40 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2 bg-green-100/50 border-b border-green-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-full text-white shadow-sm">
                        <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-green-900">
                            Jadwal Pengambilan
                        </CardTitle>
                        <CardDescription className="text-green-700">
                            Pesanan Anda dijadwalkan selesai pada:
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-green-100 shadow-sm">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        Estimasi Selesai
                    </span>

                    <div className="flex items-baseline justify-center gap-1 text-green-700">
                        <span className="text-5xl font-extrabold tracking-tighter">
                            {format(dateObj, "HH:mm")}
                        </span>
                        <span className="text-lg font-medium text-muted-foreground">
                            WITA
                        </span>
                    </div>

                    <div className="mt-2 w-full border-t border-dashed border-gray-200 my-3"></div>

                    <span className="text-base font-medium text-gray-600">
                        {format(dateObj, "EEEE, d MMMM yyyy", {
                            locale: idLocale,
                        })}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="bg-green-100/50 py-3 px-6">
                <p className="text-xs text-green-800 flex items-center justify-center w-full gap-2 text-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse"></span>
                    Silakan datang ke lokasi setelah jam tersebut.
                </p>
            </CardFooter>
        </Card>
    );
}
