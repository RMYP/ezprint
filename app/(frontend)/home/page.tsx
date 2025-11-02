"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Image from "next/image";
import Navbar from "@/components/exNavbar";

import { Printer, Mails, MessagesSquare } from "lucide-react";

// validation
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// Hooks
import { useSimulation } from "@/hooks/price-simulation.store";
import { useForm } from "react-hook-form";

const priceSimulationSchema = z.object({
  sheetCount: z
    .number({ required_error: "Sheet count is required" })
    .min(1, "Must be at least 1"),
  paperType: z.string({ required_error: "Paper type is required" }),
  finishing: z.string({ required_error: "Finishing option is required" }),
});

type PriceSimulationForm = z.infer<typeof priceSimulationSchema>;

export default function HeroSection() {
  const paperType = useSimulation((state) => state.paperType);
  const finishingOption = useSimulation((state) => state.finishingOption);
  const setPrice = useSimulation((state) => state.setPrice);
  const simulationPrice = useSimulation((state) => state.price);

  const form = useForm<PriceSimulationForm>({
    resolver: zodResolver(priceSimulationSchema),
    defaultValues: {
      sheetCount: undefined,
      paperType: "",
      finishing: "",
    },
  });

  const onSubmit = (data: PriceSimulationForm) => {
    const selectedPaper = paperType.find((p) => p.type === data.paperType);
    const selectedFinishing = finishingOption.find(
      (f) => f.type === data.finishing
    );

    if (selectedPaper && selectedFinishing) {
      setPrice(data.sheetCount, selectedPaper.price, selectedFinishing.price);
    }
  };

  return (
    <div>
      <Navbar props={undefined} />
      <section className="relative bg-gradient-to-r from-slate-500 to-zinc-900 text-white">
        <div className="container flex flex-col-reverse mx-auto px-4 py-12 md:py-20 lg:flex-row md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Printing Made Easy
            </h1>
            <div className="text-lg mt-4 leading-relaxed">
              Wujudkan ide-ide Anda dengan layanan cetak berkualitas dari kami!
              Cepat, terpercaya, dan ramah di kantong{" - "}mulai dari{" "}
              <span className="text-2xl font-bold inline">Rp.350</span> per
              lembar untuk bisnis atau kebutuhan kuliah Anda.{" "}
              <span className="text-2xl font-bold inline">
                Tanpa Minimal Order
              </span>
            </div>

            <div className="mt-6 flex gap-4">
              <Button className="px-6 py-3 bg-white text-zinc-700 font-semibold rounded-lg shadow-lg hover:bg-gray-100">
                <Link href="/orderbeta">Pesan Sekarang</Link>
              </Button>
              <Button className="px-6 py-3 bg-transparent border border-white font-semibold rounded-lg hover:bg-white hover:text-blue-600">
                Hubungi kami
              </Button>
            </div>
          </div>

          {/* Image Content */}
          <div className="md:w-1/2 overflow-auto">
            <Image alt="Banner" src={"/printer.jpg"} width={700} height={500} />
          </div>
        </div>

        {/* Background Decoration */}
        <hr className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-700 opacity-40 pointer-events-none" />
      </section>
      <section className="container mx-auto px-6 sm:px-7 lg:px-10 relative">
        <div className="py-10 my-3 flex justify-center mx-auto">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold leading-tight">
              Save Your Time and Money
            </h1>
            <p className="text-lg mt-4 leading-relaxed pe-5">
              Tidak perlu repot mengantri! Cukup pesan secara online dan ambil{" "}
              <br className="hidden lg:block" />
              saat pesanan telah siap.
            </p>
          </div>
        </div>
      </section>
      {/* Price Table */}

      <section className="container mx-auto mb-10">
        <h1 className="text-center text-3xl font-bold pb-2 lg:pb-10 md:pb-8">
          Simulasi Harga
        </h1>
        <div className="flex flex-col-reverse lg:flex-row justify-center gap-4 w-full items-center space-y-8">
          <div className="w-full max-w-md">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="bg-white p-6 rounded-2xl shadow-lg space-y-6"
            >
              <div>
                <label className="block text-gray-600 font-medium mb-2">
                  Jumlah Halaman
                </label>
                <input
                  type="number"
                  placeholder="Enter sheet count"
                  {...form.register("sheetCount", { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {form.formState.errors.sheetCount && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.sheetCount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-2">
                  Jenis Kertas
                </label>
                <select
                  {...form.register("paperType")}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Choose paper type</option>
                  {paperType.map((item, index) => (
                    <option key={index} value={item.type}>
                      {item.type}
                    </option>
                  ))}
                </select>
                {form.formState.errors.paperType && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.paperType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-2">
                  Finishing
                </label>
                <select
                  {...form.register("finishing")}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Choose finishing</option>
                  {finishingOption.map((item, index) => (
                    <option key={index} value={item.type}>
                      {item.type}
                    </option>
                  ))}
                </select>
                {form.formState.errors.finishing && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.finishing.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Calculate Price
              </Button>
            </form>
          </div>

          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg text-center">
            <h2 className="text-xl font-bold text-gray-700">
              Calculation Result
            </h2>
            <p className="text-gray-600 mt-4">Total Price:</p>
            <p className="text-2xl font-bold text-gray-800">
              {simulationPrice !== undefined
                ? `Rp.${simulationPrice.toLocaleString()}`
                : "Rp.0"}
            </p>
          </div>
        </div>
      </section>

      {/* How to order section */}
      <section className="bg-gradient-to-r from-slate-500 to-zinc-900 lg:max-h-96 sm:max-h-full">
        <div className="container pt-3 mx-auto px-6 sm:px-7 lg:px-10 text-white">
          <p>How to order?</p>
          <h1 className="text-3xl font-bold leading-tight pb-4">
            Pemesanan dilakukan hanya dengan <br className="hidden lg:block" />4
            langkah mudah
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
              <h2 className="text-xl font-bold py-2">Upload File</h2>
              <p>
                Unggah file yang ingin Anda cetak. Kami mendukung berbagai jenis
                file umum. Namun demi meminimalisir file rusak disarankan
                menggunakan format PDF.
              </p>
            </div>
            <div>
              <Button
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-lg hover:bg-gray-100"
                disabled
              >
                Step 2
              </Button>
              <h2 className="text-xl font-bold py-2">Atur Detail Cetakan</h2>
              <p>
                Sesuaikan detail dokumen Anda sebelum dicetak. Pilih jenis
                kertas, opsi cetak satu atau dua sisi, serta finishing seperti
                penjilidan sesuai kebutuhan Anda
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
                Setelah checkout, Anda akan menerima notifikasi melalui WhatsApp
                saat dokumen Anda selesai dicetak.
              </p>
            </div>
            <div>
              <Button
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-lg hover:bg-gray-100"
                disabled
              >
                Step 4
              </Button>
              <h2 className="text-xl font-bold py-2">Dokumen siap diambil</h2>
              <p>
                Dokumen dapat diambil langsung di lokasi atau diantar oleh
                kurir. Untuk pemesanan di atas 60 ribu rupiah, kami menawarkan
                gratis ongkir untuk wilayah Samarinda Kota.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact us section */}
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
                  Jika Anda memiliki pertanyaan, silakan hubungi kami melalui
                  WhatsApp. Namun perlu diingat kami hanya melayani pesan chat
                  dan tidak menerima panggilan telepon. Kami siap membantu Anda!
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
                  Jika Anda memiliki pertanyaan atau kebutuhan khusus, jangan
                  ragu untuk menghubungi kami melalui email. Kami akan merespons
                  pesan Anda secepat mungkin!
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
