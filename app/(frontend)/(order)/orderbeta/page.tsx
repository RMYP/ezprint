"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; //
import { useForm, Controller } from "react-hook-form";
import Navbar from "@/components/exNavbar";
import { zodResolver } from "@hookform/resolvers/zod"; //
import * as z from "zod";

// --- (Store) ---
import { useSimulation } from "@/hooks/price-simulation.store"; //
import { useLogin } from "@/hooks/user-store"; //

import { createCheckout, uploadFileCheckout } from "../../action/action";

// helper
// note: pindahin ke lib
const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "N/A";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
};

import { Button } from "@/components/ui/button"; //
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

// --- Mockup Function ---
// Ganti ini dengan import asli Anda nanti
// const uploadFileCheckout = (file: File, token: string) => {
//     console.log("MOCK UPLOAD:", file.name, "TOKEN:", token);
//     return new Promise<{ id: string }>((resolve) =>
//         setTimeout(() => resolve({ id: `order_${Date.now()}` }), 1500)
//     );
// };
// const createCheckout = (data: any, token: string) => {
//     console.log("MOCK CHECKOUT:", data, "TOKEN:", token);
//     return new Promise<{ id: string }>((resolve) =>
//         setTimeout(() => resolve(data.fieldId), 1000)
//     );
// };

// --- Komponen Utama Halaman ---
export default function OrderPageRedesign() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- State Lokal ---
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<MockAddress>(
        mockUserAddresses[0]
    );
    const [isCalculatedPrice, setIsCalculatedPrice] = useState(false);

    // --- State dari Zustand Store ---
    const token = useLogin((state) => state.token) || "mock_token"; // Fallback ke mock token
    const {
        paperType,
        finishingOption,
        printingType,
        setCheckout,
        checkoutPrice,
    } = useSimulation(); //

    // --- Setup Form (React Hook Form) ---
    const form = useForm<PriceSimulationForm>({
        resolver: zodResolver(priceSimulationSchema),
        defaultValues: {
            sheetCount: undefined,
            paperType: "",
            finishing: "Tanpa Jilid", // Set default
            printType: "Cetak Satu Sisi (simplex)", // Set default
            quantity: 1,
        },
    });

    // --- Efek untuk Kalkulasi Harga Real-time (DIHAPUS) ---
    // const watchedValues = form.watch([ ... ]);
    // useEffect(() => { ... }, [watchedValues, ...]);

    // --- Handler Aksi ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // --- FUNGSI BARU UNTUK KALKULASI ---
    const handleCalculatePrice = () => {
        const {
            sheetCount,
            paperType: paperTypeValue,
            finishing: finishingValue,
            quantity,
        } = form.getValues();

        if (!sheetCount || !paperTypeValue || !finishingValue || !quantity) {
            toast.error(
                "Harap isi semua field konfigurasi (Jumlah Halaman, Kertas, Finishing, Kuantitas) untuk menghitung harga."
            );
            return;
        }

        const selectedPaper = paperType.find((p) => p.type === paperTypeValue);
        const selectedFinishing = finishingOption.find(
            (f) => f.type === finishingValue
        );

        if (selectedPaper && selectedFinishing) {
            setCheckout(
                sheetCount,
                selectedPaper.price,
                selectedFinishing.price,
                quantity
            );
            setIsCalculatedPrice(true);
            toast.success("Harga berhasil dikalkulasi!");
        } else {
            setIsCalculatedPrice(false);
            toast.error(
                "Gagal menghitung harga. Pastikan semua pilihan valid."
            );
        }
    };

    // Fungsi Checkout Utama (Satu Tombol)
    const onSubmit = async (data: PriceSimulationForm) => {
        if (!selectedFile) {
            toast.error("Silakan pilih file dokumen Anda terlebih dahulu.");
            return;
        }

        if (checkoutPrice === undefined || checkoutPrice === 0) {
            toast.error("Harap klik 'Kalkulasi Harga' terlebih dahulu.");
            return;
        }

        setIsLoading(true);
        const orderToast = toast.loading("Memproses pesanan Anda...");

        try {
            // 1. Upload file
            toast.loading("Mengunggah file...", { id: orderToast });
            const { id: newOrderId } = await uploadFileCheckout(
                selectedFile,
                token as string
            );

            // 2. Buat pesanan (checkout)
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

            // 3. Navigasi ke pembayaran
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
                                        Pilih file .pdf, .doc, atau .docx yang
                                        ingin Anda cetak.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
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
                                            Klik untuk memilih file
                                        </Button>
                                    ) : (
                                        <div className="flex items-center justify-between p-4 border rounded-md">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-6 w-6 text-primary" />
                                                <span className="font-medium">
                                                    {selectedFile.name}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value =
                                                            "";
                                                    }
                                                }}
                                            >
                                                <X className="h-4 w-4" />
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
                                        Sesuaikan pesanan Anda dengan kebutuhan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="sheetCount">
                                            Jumlah Halaman
                                        </Label>
                                        <Input
                                            id="sheetCount"
                                            type="number"
                                            placeholder="Contoh: 100"
                                            {...form.register("sheetCount", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        {form.formState.errors.sheetCount && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .sheetCount.message
                                                }
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="quantity">
                                            Jumlah Rangkap (Qty)
                                        </Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            {...form.register("quantity", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        {form.formState.errors.quantity && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .quantity.message
                                                }
                                            </p>
                                        )}
                                    </div>
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
                                            <p className="text-red-500 text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .paperType.message
                                                }
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Jenis Print</Label>
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
                                                        <SelectValue placeholder="Pilih tipe print" />
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
                                            <p className="text-red-500 text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .printType.message
                                                }
                                            </p>
                                        )}
                                    </div>
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
                                                                    (+
                                                                    {formatPrice(
                                                                        item.price
                                                                    )}
                                                                    )
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {form.formState.errors.finishing && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {
                                                    form.formState.errors
                                                        .finishing.message
                                                }
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* --- 3. Kartu Alamat (Fitur Baru) --- */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>3. Metode Pengambilan</CardTitle>
                                    <CardDescription>
                                        Pilih cara Anda ingin mengambil pesanan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {mockUserAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`p-4 border rounded-lg cursor-pointer ${
                                                selectedAddress.id === addr.id
                                                    ? "border-primary ring-2 ring-primary/20"
                                                    : "border-border"
                                            }`}
                                            onClick={() =>
                                                setSelectedAddress(addr)
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <addr.icon className="h-5 w-5 text-primary" />
                                                <span className="font-semibold">
                                                    {addr.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1 ml-8">
                                                {addr.address}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </form>
                    </div>

                    {/* === KOLOM KANAN (RINGKASAN) === */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Ringkasan Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Dokumen
                                        </span>
                                        <span>{selectedFile?.name || "-"}</span>
                                    </div>
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
                                            Jenis Kertas
                                        </span>
                                        <span>
                                            {form.watch("paperType") || "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Finishing
                                        </span>
                                        <span>
                                            {form.watch("finishing") || "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Kuantitas
                                        </span>
                                        <span>
                                            {form.watch("quantity") || 0}x
                                        </span>
                                    </div>
                                </div>
                                {isCalculatedPrice ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleCalculatePrice}
                                        disabled
                                    >
                                        Kalkulasi Harga
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleCalculatePrice}
                                    >
                                        Kalkulasi Harga
                                    </Button>
                                )}

                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">
                                        Total Harga
                                    </span>
                                    <span className="text-2xl font-bold text-primary">
                                        {formatPrice(checkoutPrice)}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {isCalculatedPrice ? (
                                    <Button
                                        type="submit"
                                        form="order-form"
                                        className="w-full text-lg py-6"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            "Lanjutkan ke Pembayaran"
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        form="order-form"
                                        className="w-full text-lg py-6"
                                        disabled
                                    >
                                        Lanjutkan ke Pembayaran
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
