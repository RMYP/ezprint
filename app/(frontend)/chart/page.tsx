"use client";

import Navbar from "@/components/exNavbar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash, ShoppingCart, ListCollapse } from "lucide-react";
import { getChart } from "../action/action";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PaymentList {
  id: string;
  transactionId: string;
  orderId: string;
  grossAmount: string;
  paymentType: string;
  transactionTime: string;
  expiryTime: string;
  vaNumber: string;
  bank: string;
  transactionStatus: string;
}

interface ChartList {
  id: string;
  sheetCount: number;
  paperType: string;
  finishing: string;
  quantity: number;
  printType: string;
  totalPrice: string;
  status: string;
  paymentStatus: boolean;
  documentPath: string;
  documentName: string;
  userId: string;
  orderDate: string;
  Payment: PaymentList[];
}

export default function Page() {
  const router = useRouter();
  const [chartList, setCartList] = useState<ChartList[] | null>(null);

  useEffect(() => {
    const getChartList = async () => {
      try {
        const data = await getChart();
        setCartList(data);
      } catch (err: unknown) {
        console.error(err);
        setCartList([]); // fallback to empty array if API fails
      }
    };
    getChartList();
  }, []);

  const visibleItems =
    chartList?.filter((item) => !item.paymentStatus) ?? [];


  return (
    <div className="space-y-5">
      <Navbar props={"bg-white"} />

      {/* ========================= */}
      {/* 1️⃣ Loading State */}
      {/* ========================= */}
      {!chartList ? (
        <div className="max-w-7xl mx-auto bg-white px-5 lg:px-10 lg:pt-5">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Daftar Pesanan
          </h2>

          {/* Desktop Skeleton */}
          <div className="hidden sm:table w-full border-collapse">
            <div className="table-header-group">
              <div className="table-row">
                {[
                  "Tanggal Pemesanan",
                  "Nama Dokumen",
                  "Status Pesanan",
                  "Harga",
                  "Aksi",
                ].map((header, index) => (
                  <div
                    key={index}
                    className="table-cell font-semibold py-2 px-4"
                  >
                    {header}
                  </div>
                ))}
              </div>
            </div>
            <div className="table-row-group">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="table-row">
                  <div className="table-cell py-4 px-4">
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="table-cell py-4 px-4">
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="table-cell py-4 px-4">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="table-cell py-4 px-4 text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </div>
                  <div className="table-cell py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Skeleton */}
          <div className="sm:hidden space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border rounded-lg shadow-md p-4 space-y-3"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20 ml-auto" />
                <div className="flex justify-end gap-2 mt-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : visibleItems.length === 0 ? (
        /* ========================= */
        /* 2️⃣ Empty Cart State */
        /* ========================= */
        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingCart size={64} className="text-gray-400 mb-4" />
          <p className="text-lg text-gray-500">
            Tidak ada pesanan di keranjang kamu.
          </p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Mulai Belanja
          </Button>
        </div>
      ) : (
        /* ========================= */
        /* 3️⃣ Cart Table with Data */
        /* ========================= */
        <div className="max-w-7xl mx-auto bg-white px-5 lg:px-10 lg:pt-5">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Keranjang Pesanan
          </h2>

          <Table className="hidden sm:table">
            <TableCaption>Keranjang pesanan</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Tanggal Pemesanan</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Nama Dokumen</TableHead>
                <TableHead>Status Pesanan</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartList
                .filter((item) => !item.paymentStatus)
                .map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.orderDate.replace(
                        /^(\d{4})-(\d{2})-(\d{2}).*$/,
                        "$3-$2-$1"
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Button onClick={() => router.push(`/status/${item.id}`)}>
                        <ListCollapse />
                      </Button>
                    </TableCell>
                    <TableCell>{item.documentName}</TableCell>
                    <TableCell>
                      {item.Payment && item.Payment.length > 0 ? (
                        item.Payment[0].transactionStatus === "pending" ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Menunggu Pembayaran
                          </span>
                        ) : item.Payment[0].transactionStatus ===
                          "settlement" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Pembayaran Berhasil
                          </span>
                        ) : item.Payment[0].transactionStatus === "cancel" ||
                          item.Payment[0].transactionStatus === "expire" ? (
                          <span className="px-2 py-1 bg-red-100 text-red-900 rounded-full text-xs">
                            {item.Payment[0].transactionStatus}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Pembayaran Berhasil
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-red-800 rounded-full text-xs">
                          Belum Checkout
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp.{item.totalPrice}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-row justify-end gap-2">
                        <Button variant="destructive">
                          <Trash size={16} className="mr-1" />
                        </Button>
                        {item.Payment?.[0]?.transactionStatus === "pending" ? (
                          <Button
                            variant="outline"
                            className="w-[125px] justify-between border-green-500"
                            onClick={() =>
                              router.push(
                                `/checkout/payment/${item.Payment[0].transactionId}/${item.id}`
                              )
                            }
                          >
                            <ShoppingCart />
                            Bayar
                          </Button>
                        ) : item.Payment?.[0]?.transactionStatus === "cancel" ||
                          item.Payment?.[0]?.transactionStatus === "expire" ? (
                          <Button
                            variant="outline"
                            className="w-[125px] justify-between border-red-200"
                            onClick={() => router.push(`/checkout/${item.id}`)}
                          >
                            <ShoppingCart />
                            Bayar Ulang
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-[125px] justify-between border-yellow-400"
                            onClick={() => router.push(`/checkout/${item.id}`)}
                          >
                            <ShoppingCart />
                            Checkout
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
