"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/exNavbar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mails, MessagesSquare, Loader2 } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSimulation } from "@/hooks/beta-price-simulation";
import { useForm, useWatch, Controller } from "react-hook-form";

// Schema diperbarui agar sesuai dengan halaman Order (ada quantity & printType)
const priceSimulationSchema = z.object({
    sheetCount: z.number().min(1, "Minimal 1 halaman"),
    quantity: z.number().min(1, "Minimal 1 rangkap"),
    paperType: z.string().nonempty("Wajib dipilih"),
    finishing: z.string().nonempty("Wajib dipilih"),
    inkType: z.string().nonempty("Wajib dipilih"),
    printType: z.string().nonempty("Wajib dipilih"),
});

type PriceSimulationForm = z.infer<typeof priceSimulationSchema>;

export default function HeroSection() {
    const {
        paperType,
        finishingOption,
        inkType,
        printingType,
        price: simulationPrice,
        calculatePrice,
    } = useSimulation();

    const [isAutoCalculating, setIsAutoCalculating] = useState(false);

    const form = useForm<PriceSimulationForm>({
        resolver: zodResolver(priceSimulationSchema),
        mode: "onChange",
        defaultValues: {
            sheetCount: undefined,
            quantity: 1,
            paperType: "",
            finishing: "",
            inkType: "",
            printType: "",
        },
    });

    const watchedValues = useWatch({ control: form.control });

    const performCalculation = (data: PriceSimulationForm) => {
        const selectedPaper = paperType.find((p) => p.type === data.paperType);
        const selectedInk = inkType.find((p) => p.type === data.inkType);
        const selectedFinishing = finishingOption.find(
            (f) => f.type === data.finishing
        );
        const selectedPrint = printingType.find(
            (p) => p.type === data.printType
        );

        if (
            selectedPaper &&
            selectedInk &&
            selectedFinishing &&
            selectedPrint
        ) {
            calculatePrice({
                sheet: data.sheetCount,
                quantity: data.quantity,
                paperPrice: selectedPaper.price,
                inkPrice: selectedInk.price,
                finishingPrice: selectedFinishing.price,
                printTypePrice: selectedPrint.price,
            });
        }
    };

    // Effect Debounce
    useEffect(() => {
        const vals = form.getValues();
        // Cek apakah SEMUA field sudah terisi
        const isReady = Object.values(vals).every(
            (val) => val !== undefined && val !== ""
        );

        if (isReady && vals.sheetCount > 0 && vals.quantity > 0) {
            setIsAutoCalculating(true);
            const timer = setTimeout(() => {
                form.handleSubmit(performCalculation)();
                setIsAutoCalculating(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedValues]);

    // Helper format rupiah
    const formatRupiah = (val: number | undefined) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <div>
            <Navbar props={undefined} />

            <section className="relative bg-gradient-to-r from-slate-500 to-zinc-900 text-white">
                <div className="container flex flex-col-reverse mx-auto px-4 py-12 md:py-20 md:px-20 lg:flex-row items-center gap-10">
                    <div className="md:w-1/2 w-full">
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Printing Made Easy
                        </h1>
                        <div className="text-lg mt-4 leading-relaxed">
                            Wujudkan ide-ide Anda dengan layanan cetak
                            berkualitas dari kami! Cepat, terpercaya, dan ramah
                            di kantong - mulai dari{" "}
                            <span className="text-2xl font-bold inline">
                                Rp.300
                            </span>{" "}
                            per lembar untuk bisnis atau kebutuhan kuliah Anda.
                            <span className="text-2xl font-bold inline block mt-2">
                                Tanpa Minimal Order
                            </span>
                        </div>
                        <div className="mt-8 flex gap-4 flex flex-col lg:flex-row">
                            <Button
                                className="px-8 py-6 text-lg bg-white text-zinc-900 hover:bg-gray-100 font-semibold"
                                asChild
                            >
                                <Link href="/order">Pesan Sekarang</Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="px-8 py-6 text-lg text-white border-white hover:bg-white hover:text-zinc-900 bg-transparent"
                            >
                                Hubungi Kami
                            </Button>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                        <Image
                            alt="Banner Printer"
                            src={"/printer.jpg"}
                            width={600}
                            height={400}
                            className="rounded-xl shadow-2xl object-cover"
                        />
                    </div>
                </div>
            </section>

            <section className="container mx-auto my-16 px-4">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Simulasi Harga
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Cek estimasi biaya cetak dokumen Anda sebelum memesan.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
                    <div className="lg:col-span-2">
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Konfigurasi Cetak</CardTitle>
                                <CardDescription>
                                    Masukkan detail dokumen untuk menghitung
                                    estimasi harga.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="sheetCount">
                                            Jumlah Halaman (per rangkap)
                                        </Label>
                                        <Input
                                            id="sheetCount"
                                            type="number"
                                            min={1}
                                            placeholder="Contoh: 50"
                                            {...form.register("sheetCount", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">
                                            Jumlah Rangkap (Qty)
                                        </Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min={1}
                                            defaultValue={1}
                                            {...form.register("quantity", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>

                                    <div className="space-y-2">
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
                                                        <SelectValue placeholder="Pilih kertas" />
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
                                                                    (+
                                                                    {item.price}
                                                                    )
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
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
                                                        <SelectValue placeholder="Pilih warna" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {inkType.map((item) => (
                                                            <SelectItem
                                                                key={item.type}
                                                                value={
                                                                    item.type
                                                                }
                                                            >
                                                                {item.type} (+
                                                                {item.price})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
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
                                    <div className="space-y-2">
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
                                                                        0 &&
                                                                        `(+${formatRupiah(
                                                                            item.price
                                                                        )})`}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 sticky top-24">
                        <Card className="shadow-lg border-t-4 border-t-primary">
                            <CardHeader className="pb-4">
                                <CardTitle>Estimasi Biaya</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm space-y-2 text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Jumlah Halaman</span>
                                        <span className="font-medium text-foreground">
                                            {form.watch("sheetCount") || "-"}{" "}
                                            lbr
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Kuantitas</span>
                                        <span className="font-medium text-foreground">
                                            {form.watch("quantity") || "-"}{" "}
                                            rangkap
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-semibold">
                                        Total
                                    </span>
                                    <div className="text-right">
                                        {isAutoCalculating ? (
                                            <div className="flex items-center gap-2 text-primary animate-pulse">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span className="font-semibold">
                                                    Menghitung...
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-3xl font-bold text-primary">
                                                {simulationPrice
                                                    ? formatRupiah(
                                                          simulationPrice
                                                      )
                                                    : "Rp 0"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full py-6 text-lg" asChild>
                                    <Link href="/order">
                                        Mulai Pesan Sekarang
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-r from-slate-500 to-zinc-900 lg:max-h-96 sm:max-h-full">
                <div className="container pt-3 mx-auto px-6 sm:px-7 lg:px-10 text-white">
                    <p>How to order?</p>
                    <h1 className="text-3xl font-bold leading-tight pb-4">
                        Pemesanan dilakukan hanya dengan{" "}
                        <br className="hidden lg:block" />4 langkah mudah
                    </h1>
                    {/* Grid */}
                    <div className="grid lg:grid-cols-4 grid-rows-4 gap-6 py-3">
                        <div>
                            <Button
                                className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-lg hover:bg-gray-100"
                                disabled
                            >
                                Step 1
                            </Button>
                            <h2 className="text-xl font-bold py-2">
                                Upload File
                            </h2>
                            <p>
                                Unggah file yang ingin Anda cetak. Kami
                                mendukung berbagai jenis file umum. Namun demi
                                meminimalisir file rusak disarankan menggunakan
                                format PDF.
                            </p>
                        </div>
                        <div>
                            <Button
                                className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-lg hover:bg-gray-100"
                                disabled
                            >
                                Step 2
                            </Button>
                            <h2 className="text-xl font-bold py-2">
                                Atur Detail Cetakan
                            </h2>
                            <p>
                                Sesuaikan detail dokumen Anda sebelum dicetak.
                                Pilih jenis kertas, opsi cetak satu atau dua
                                sisi, serta finishing seperti penjilidan sesuai
                                kebutuhan Anda
                            </p>
                        </div>
                        <div>
                            <Button
                                className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-lg hover:bg-gray-100"
                                disabled
                            >
                                Step 3
                            </Button>
                            <h2 className="text-xl font-bold py-2">Checkout</h2>
                            <p>
                                Setelah checkout, Anda akan menerima notifikasi
                                melalui WhatsApp saat dokumen Anda selesai
                                dicetak.
                            </p>
                        </div>
                        <div>
                            <Button
                                className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-lg hover:bg-gray-100"
                                disabled
                            >
                                Step 4
                            </Button>
                            <h2 className="text-xl font-bold py-2">
                                Dokumen siap diambil
                            </h2>
                            <p>
                                Dokumen dapat diambil langsung di lokasi atau
                                diantar oleh kurir. Untuk pemesanan di atas 60
                                ribu rupiah, kami menawarkan gratis ongkir untuk
                                wilayah Samarinda Kota.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="my-10">
                <div>
                    <div className="text-center mb-10">
                        <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                            How to Contact Us?
                        </h1>
                    </div>
                    <div className="flex flex-col lg:flex-row justify-center lg:gap-20 gap-5">
                        <Card className="lg:w-1/3 w-full text-center ">
                            <CardHeader>
                                <CardTitle>
                                    <div className="flex flex-col items-center gap-4">
                                        <MessagesSquare size={70} />
                                        <h1>Chat Whatsapp</h1>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Jika Anda memiliki pertanyaan, silakan
                                    hubungi kami melalui WhatsApp. Namun perlu
                                    diingat kami hanya melayani pesan chat dan
                                    tidak menerima panggilan telepon. Kami siap
                                    membantu Anda!
                                </p>
                                <p className="py-4 underline decoration-solid text-blue-600">
                                    +62-895-3287-96965
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="lg:w-1/3 w-full text-center ">
                            <CardHeader>
                                <CardTitle>
                                    <div className="flex flex-col items-center gap-4">
                                        <Mails size={70} />
                                        <h1>Emails</h1>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Jika Anda memiliki pertanyaan atau kebutuhan
                                    khusus, jangan ragu untuk menghubungi kami
                                    melalui email. Kami akan merespons pesan
                                    Anda secepat mungkin!
                                </p>
                                <p className="py-4 underline decoration-solid text-blue-600">
                                    rizkimauludinyoga@gmail.com
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
            <footer></footer>
        </div>
    );
}
