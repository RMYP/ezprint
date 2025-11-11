"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useForm, Controller, useWatch } from "react-hook-form"; // Tambahkan useWatch
import Navbar from "@/components/exNavbar";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertTitle } from "@/components/ui/alert";

import { useSimulation } from "@/hooks/price-simulation.store";
import { useLogin } from "@/hooks/user-store";

import { createCheckout, uploadFileCheckout } from "../../action/action";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, UploadCloud, X, Home, Store } from "lucide-react";

// Helper format price
const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
};

const priceSimulationSchema = z.object({
    sheetCount: z
        .number({ required_error: "Jumlah halaman wajib diisi" })
        .min(1, "Minimal 1 halaman"),
    paperType: z
        .string({ required_error: "Jenis kertas wajib dipilih" })
        .nonempty("Jenis kertas wajib dipilih"),
    finishing: z
        .string({ required_error: "Finishing wajib dipilih" })
        .nonempty("Finishing wajib dipilih"),
    printType: z
        .string({ required_error: "Jenis print wajib dipilih" })
        .nonempty("Jenis print wajib dipilih"),
    quantity: z
        .number({ required_error: "Jumlah rangkap wajib diisi" })
        .min(1, "Minimal 1 rangkap"),
});
type PriceSimulationForm = z.infer<typeof priceSimulationSchema>;

const mockUserAddresses = [
    {
        id: "addr_1",
        type: "store",
        label: "Ambil di Toko",
        address: "Toko EzPrint, Jl. Perjuangan, gg. Alam Segar 2 No.2",
        icon: Store,
    },
    {
        id: "addr_2",
        type: "gosend",
        label: "Alamat Rumah (GoSend)",
        address: "Jl. A. Wahab Syahranie Gg. 5 No. 42",
        icon: Home,
    },
];
type MockAddress = (typeof mockUserAddresses)[0];

export default function OrderPageRedesign() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    // State baru untuk indikator sedang menunggu kalkulasi debounce
    const [isCalculating, setIsCalculating] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<MockAddress>(
        mockUserAddresses[0]
    );
    // isCalculatedPrice tetap dipakai untuk memastikan harga valid sebelum checkout
    const [isCalculatedPrice, setIsCalculatedPrice] = useState(false);

    const token = useLogin((state) => state.token);
    const {
        paperType,
        finishingOption,
        printingType,
        setCheckout,
        checkoutPrice,
    } = useSimulation();

    const form = useForm<PriceSimulationForm>({
        resolver: zodResolver(priceSimulationSchema),
        mode: "onChange", // Agar validasi berjalan real-time
        defaultValues: {
            sheetCount: undefined,
            paperType: "",
            finishing: "Tanpa Jilid",
            printType: "Cetak Satu Sisi (simplex)",
            quantity: 1,
        },
    });

    const watchedValues = useWatch({
        control: form.control,
    });

    useEffect(() => {
        const {
            sheetCount,
            paperType: selectedPaperType,
            finishing,
            quantity,
        } = form.getValues();

        const isFormValid =
            sheetCount &&
            sheetCount > 0 &&
            selectedPaperType &&
            finishing &&
            quantity &&
            quantity > 0;

        if (!isFormValid) {
            setIsCalculatedPrice(false);
            setIsCalculating(false);
            return;
        }

        // Mulai loading kalkulasi (menunggu debounce)
        setIsCalculating(true);
        // Set false dulu agar user tidak bisa checkout selama menunggu
        setIsCalculatedPrice(false);

        // Setup Timer Debounce (1 detik = 1000ms)
        const debounceTimer = setTimeout(() => {
            const paper = paperType.find((p) => p.type === selectedPaperType);
            const finish = finishingOption.find((f) => f.type === finishing);

            if (paper && finish) {
                // Lakukan kalkulasi
                setCheckout(sheetCount, paper.price, finish.price, quantity);
                setIsCalculatedPrice(true);
            }
            // Selesai kalkulasi
            setIsCalculating(false);
        }, 1000);

        // Cleanup function: akan dijalankan jika watchedValues berubah sebelum 1 detik
        return () => {
            clearTimeout(debounceTimer);
        };
    }, [watchedValues, paperType, finishingOption, setCheckout, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const onSubmit = async (data: PriceSimulationForm) => {
        if (!token) {
            toast.error("Anda harus login terlebih dahulu.");
            router.push("/login");
            return;
        }
        if (!selectedFile) {
            toast.error("Silakan pilih file dokumen Anda terlebih dahulu.");
            return;
        }

        // Double check safety, meskipun tombol sudah didisable
        if (!isCalculatedPrice || isCalculating) {
            toast.error("Mohon tunggu perhitungan harga selesai.");
            return;
        }

        setIsLoading(true);
        const orderToast = toast.loading("Memproses pesanan Anda...");

        try {
            toast.loading("Mengunggah file...", { id: orderToast });
            const { id: newOrderId } = await uploadFileCheckout(
                selectedFile,
                token as string
            );

            toast.loading("Membuat pesanan...", { id: orderToast });
            const checkoutData = {
                fieldId: newOrderId,
                ...data,
                totalPrice: checkoutPrice,
            };
            const { id: orderId } = await createCheckout(
                checkoutData,
                token as string
            );

            toast.success("Pesanan berhasil dibuat!", { id: orderToast });
            router.push(`/checkout/${orderId}`);
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan tidak terduga";
            toast.error(errorMessage, { id: orderToast });
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Navbar props="bg-white mb-3 shadow-md" />
            <div className="bg-muted/40 min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* === KOLOM KIRI (FORM) === */}
                    <div className="lg:col-span-2 space-y-6">
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            id="order-form"
                        >
                            {/* --- 1. Kartu Upload Dokumen --- */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>1. Upload Dokumen</CardTitle>
                                    <CardDescription>
                                        Pilih file .pdf yang ingin Anda cetak.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf"
                                    />
                                    {!selectedFile ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-32 border-dashed border-2"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <UploadCloud className="mr-2" />
                                            Klik untuk memilih file (PDF)
                                        </Button>
                                    ) : (
                                        <div className="flex items-center justify-between p-4 border rounded-md bg-blue-50/50 border-blue-200">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                                                <div className="truncate">
                                                    <p className="font-medium text-blue-900 truncate">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-xs text-blue-700">
                                                        {(
                                                            selectedFile.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{" "}
                                                        MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value =
                                                            "";
                                                    }
                                                }}
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* --- 2. Kartu Konfigurasi Cetak --- */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>2. Konfigurasi Cetak</CardTitle>
                                    <CardDescription>
                                        Harga akan dihitung otomatis setelah
                                        Anda selesai mengisi.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Sheet Count */}
                                    <div>
                                        <Label htmlFor="sheetCount">
                                            Jumlah Halaman (per rangkap)
                                        </Label>
                                        <Input
                                            id="sheetCount"
                                            type="number"
                                            min={1}
                                            placeholder="Contoh: 100"
                                            {...form.register("sheetCount", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        {form.formState.errors.sheetCount && (
                                            <p className="text-destructive text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .sheetCount.message
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <Label htmlFor="quantity">
                                            Jumlah Rangkap (Qty)
                                        </Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min={1}
                                            {...form.register("quantity", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        {form.formState.errors.quantity && (
                                            <p className="text-destructive text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .quantity.message
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Paper Type */}
                                    <div>
                                        <Label>Jenis Kertas</Label>
                                        <Controller
                                            control={form.control}
                                            name="paperType"
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih jenis kertas" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {paperType.map(
                                                            (item) => (
                                                                <SelectItem
                                                                    key={
                                                                        item.type
                                                                    }
                                                                    value={
                                                                        item.type
                                                                    }
                                                                >
                                                                    {item.type}{" "}
                                                                    (
                                                                    {formatPrice(
                                                                        item.price
                                                                    )}
                                                                    /lbr)
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {form.formState.errors.paperType && (
                                            <p className="text-destructive text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .paperType.message
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Print Type */}
                                    <div>
                                        <Label>Tipe Cetak</Label>
                                        <Controller
                                            control={form.control}
                                            name="printType"
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih tipe cetak" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {printingType.map(
                                                            (item) => (
                                                                <SelectItem
                                                                    key={
                                                                        item.type
                                                                    }
                                                                    value={
                                                                        item.type
                                                                    }
                                                                >
                                                                    {item.type}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    {/* Finishing */}
                                    <div className="md:col-span-2">
                                        <Label>Finishing</Label>
                                        <Controller
                                            control={form.control}
                                            name="finishing"
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih finishing" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {finishingOption.map(
                                                            (item) => (
                                                                <SelectItem
                                                                    key={
                                                                        item.type
                                                                    }
                                                                    value={
                                                                        item.type
                                                                    }
                                                                >
                                                                    {item.type}{" "}
                                                                    {item.price >
                                                                    0
                                                                        ? `(+${formatPrice(
                                                                              item.price
                                                                          )})`
                                                                        : ""}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* --- 3. Kartu Alamat --- */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>3. Metode Pengambilan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {mockUserAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                                                selectedAddress.id === addr.id
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-border hover:border-primary/50"
                                            }`}
                                            onClick={() =>
                                                setSelectedAddress(addr)
                                            }
                                        >
                                            <addr.icon
                                                className={`h-5 w-5 mt-0.5 ${
                                                    selectedAddress.id ===
                                                    addr.id
                                                        ? "text-primary"
                                                        : "text-muted-foreground"
                                                }`}
                                            />
                                            <div>
                                                <p
                                                    className={`font-semibold ${
                                                        selectedAddress.id ===
                                                        addr.id
                                                            ? "text-foreground"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {addr.label}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {addr.address}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </form>
                    </div>

                    {/* === KOLOM KANAN (RINGKASAN) === */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-lg border-t-4 border-t-primary">
                            <CardHeader className="pb-4">
                                <CardTitle>Ringkasan Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Dokumen
                                        </span>
                                        <span
                                            className="font-medium truncate max-w-[150px]"
                                            title={selectedFile?.name}
                                        >
                                            {selectedFile?.name || "-"}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Jumlah Halaman
                                        </span>
                                        <span>
                                            {form.watch("sheetCount") || 0} lbr
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Kuantitas
                                        </span>
                                        <span>
                                            {form.watch("quantity") || 0}{" "}
                                            rangkap
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Kertas
                                        </span>
                                        <span className="text-right">
                                            {form.watch("paperType") || "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Finishing
                                        </span>
                                        <span className="text-right">
                                            {form.watch("finishing") || "-"}
                                        </span>
                                    </div>
                                </div>
                                {checkoutPrice &&
                                    (checkoutPrice < 50000 ? (
                                        <Alert> 
                                            <AlertTitle className="flex items-center justify-center">{`Pesanan < Rp50.000 kena admin Rp1.000`}</AlertTitle>
                                        </Alert>
                                    ) : (
                                        <div></div>
                                    ))}
                                <Separator className="my-4" />

                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">
                                        Total Harga
                                    </span>
                                    <div className="text-right">
                                        {isCalculating ? (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm font-medium">
                                                    Menghitung...
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-2xl font-bold text-primary">
                                                {isCalculatedPrice
                                                    ? formatPrice(checkoutPrice)
                                                    : "Rp 0"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    form="order-form"
                                    className="w-full text-lg py-6"
                                    disabled={
                                        isLoading ||
                                        isCalculating ||
                                        !isCalculatedPrice
                                    }
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : isCalculating ? (
                                        "Menunggu Kalkulasi..."
                                    ) : (
                                        "Lanjutkan ke Pembayaran"
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
