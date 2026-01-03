"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useForm, Controller, useWatch } from "react-hook-form";
import Navbar from "@/components/exNavbar";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useSimulation } from "@/hooks/price-simulation.store";
import { useLogin } from "@/hooks/user-store";
import { createCheckout, uploadFileCheckout } from "../../action/action";

import { formatEstimation } from "@/lib/helper";
import { Textarea } from "@/components/ui/textarea";
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
import {
    Loader2,
    FileText,
    UploadCloud,
    X,
    Home,
    Store,
    MessageSquare,
    Timer,
} from "lucide-react";

// Helper format price
const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
};

// --- 1. Schema Zod (Termasuk Notes) ---
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
    inkType: z
        .string({ required_error: "Warna tinta wajib dipilih" })
        .nonempty("Warna tinta wajib dipilih"),
    quantity: z
        .number({ required_error: "Jumlah rangkap wajib diisi" })
        .min(1, "Minimal 1 rangkap"),
    notes: z.string().max(300, "Maksimal 300 Karakter").optional(),
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
    const [isCalculating, setIsCalculating] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<MockAddress>(
        mockUserAddresses[0]
    );
    const [isCalculatedPrice, setIsCalculatedPrice] = useState(false);

    const token = useLogin((state) => state.token);

    const {
        paperType,
        finishingOption,
        printingType,
        inkType: inkTypeOptions,
        setCheckout,
        checkoutPrice,
        fetchPricingData,
        setPrediction,
        predictionTime,
    } = useSimulation();

    useEffect(() => {
        fetchPricingData();
    }, [fetchPricingData]);

    const form = useForm<PriceSimulationForm>({
        resolver: zodResolver(priceSimulationSchema),
        mode: "onChange",
        defaultValues: {
            sheetCount: undefined,
            paperType: "",
            finishing: "Tanpa Jilid",
            printType: "Cetak Satu Sisi (simplex)",
            inkType: "",
            quantity: 1,
            notes: "",
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
            inkType: selectedInkType,
            printType,
        } = form.getValues();

        const isFormValid =
            sheetCount &&
            sheetCount > 0 &&
            selectedPaperType &&
            finishing &&
            selectedInkType &&
            quantity &&
            quantity > 0;

        if (!isFormValid) {
            setIsCalculatedPrice(false);
            setIsCalculating(false);
            return;
        }

        setIsCalculating(true);
        setIsCalculatedPrice(false);

        const debounceTimer = setTimeout(() => {
            const paper = paperType.find((p) => p.type === selectedPaperType);
            const finish = finishingOption.find((f) => f.type === finishing);
            const ink = inkTypeOptions?.find((i) => i.type === selectedInkType);

            if (paper && finish && ink) {
                setCheckout(
                    sheetCount,
                    paper.price,
                    finish.price,
                    quantity,
                    ink.price
                );
                console.log(finishing);
                setPrediction(
                    sheetCount * quantity,
                    selectedInkType,
                    printType,
                    quantity,
                    finishing
                );
                setIsCalculatedPrice(true);
            }
            setIsCalculating(false);
        }, 1000);

        return () => {
            clearTimeout(debounceTimer);
        };
    }, [
        watchedValues,
        paperType,
        finishingOption,
        inkTypeOptions,
        setCheckout,
        form,
    ]);

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

                                    {/* Ink Type */}
                                    <div>
                                        <Label>Warna Tinta</Label>
                                        <Controller
                                            control={form.control}
                                            name="inkType"
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih warna tinta" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {inkTypeOptions?.map(
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
                                        {form.formState.errors.inkType && (
                                            <p className="text-destructive text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .inkType.message
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
                                        {form.formState.errors.printType && (
                                            <p className="text-destructive text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .printType.message
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Finishing */}
                                    <div>
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
                                        {form.formState.errors.finishing && (
                                            <p className="text-destructive text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .finishing.message
                                                }
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* --- 2.5. KARTU BARU: CATATAN (NOTES) --- */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                        <CardTitle>Catatan Tambahan</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Berikan instruksi khusus untuk operator
                                        percetakan (Opsional).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid w-full gap-2">
                                        <Label htmlFor="notes">
                                            Pesan / Catatan
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Contoh: Tolong jilid warna biru..."
                                            className="resize-none min-h-[100px]"
                                            maxLength={200}
                                            {...form.register("notes")}
                                        />
                                        <div className="text-xs text-muted-foreground text-right mt-1">
                                            {form.watch("notes")?.length || 0} /
                                            200 karakter
                                        </div>
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
                                            Tinta
                                        </span>
                                        <span className="text-right">
                                            {form.watch("inkType") || "-"}
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
                                    {/* Menampilkan Catatan di Ringkasan (Optional) */}
                                    {form.watch("notes") && (
                                        <div className="flex flex-col gap-1 mt-2 p-2 bg-muted/50 rounded-md border border-muted">
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                Catatan:
                                            </span>
                                            <span className="text-xs italic break-words">
                                                "{form.watch("notes")}"
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <Timer className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            Estimasi Pengerjaan
                                        </span>
                                    </div>

                                    <div className="text-sm font-bold text-blue-900">
                                        {isCalculating ? (
                                            <span className="animate-pulse">
                                                ...
                                            </span>
                                        ) : predictionTime &&
                                          predictionTime > 0 ? (
                                            <span>
                                                ±{" "}
                                                {formatEstimation(
                                                    predictionTime
                                                )}{" "}
                                                k
                                            </span>
                                        ) : (
                                            <span className="text-blue-400">
                                                -
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {checkoutPrice && checkoutPrice < 50000 ? (
                                    <Alert>
                                        <AlertTitle className="flex items-center justify-center text-xs">
                                            {`Pesanan < Rp50.000 kena admin Rp1.000`}
                                        </AlertTitle>
                                    </Alert>
                                ) : (
                                    <div></div>
                                )}
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
