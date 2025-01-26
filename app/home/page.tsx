import React from "react";
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

export default function HeroSection() {
  return (
    <div>
      <Navbar />
      <section className="relative bg-gradient-to-r from-slate-500 to-zinc-900 text-white">
        <div className="container flex flex-col-reverse mx-auto px-4 py-12 md:py-20 lg:flex-row md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Printing Made Easy
            </h1>
            <div className="text-lg mt-4 leading-relaxed">
              Wujudkan ide-ide Anda dengan layanan cetak berkualitas dari kami!
              Cepat, terpercaya, dan ramah di kantong{" - "}mulai dari{" "}
              <span className="text-2xl font-bold inline">Rp.300</span> per
              lembar untuk bisnis atau kebutuhan kuliah Anda.
            </div>

            <div className="mt-6 flex gap-4">
              <Button className="px-6 py-3 bg-white text-zinc-700 font-semibold rounded-lg shadow-lg hover:bg-gray-100">
                Get Started
              </Button>
              <Button className="px-6 py-3 bg-transparent border border-white font-semibold rounded-lg hover:bg-white hover:text-blue-600">
                Learn More
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
                kurir. Untuk pemesanan di atas 50 ribu rupiah, kami menawarkan
                gratis ongkir untuk wilayah Samarinda Kota.
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
          <div className="flex flex-col lg:flex-row justify-center gap-20">
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
    </div>
  );
}
