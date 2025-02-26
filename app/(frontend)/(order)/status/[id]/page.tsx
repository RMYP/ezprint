"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/exNavbar";
import { CheckCircle, Circle, MapPinned } from "lucide-react";
import { getChartById } from "../../../action/action";
import { Skeleton } from "@/components/ui/skeleton";

const stages = [
  "Belum Checkout",
  "Menunggu Pembayaran",
  "Pesanan Diterima",
  "Pesanan Diproses",
  "Pesanan Siap Diambil",
];

interface TransactionData {
  sheetCount: number;
  paperType: String;
  finishing: String;
  quantity: number;
  printType: String;
  totalPrice: number;
  status: string;
  paymentStatus: Boolean;
  documentPath: String;
  documentName: String;
  userId: String;
  orderDate: String;
}

export default function OrderProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [transactionData, setTransactionData] = useState<
    TransactionData | undefined
  >();
  const [currentStage, setCurrentStage] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const { id } = await params;
        const data = await getChartById(id);
        const date = new Date(data.orderDate);
        const newDate = date
          .toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Makassar",
          })
          .replace(/\//g, "-");
        data.orderDate = newDate;
        setTransactionData(data);

        const statusMap: Record<string, number> = {
          waitingCheckout: 0,
          waitingPayment: 1,
          confirmOrder: 2,
          onProgress: 3,
          finished: 4,
        };

        if (data?.status in statusMap) {
          console.log(data.status);
          setCurrentStage(statusMap[data.status]);
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        console.error("Error fetching transaction data:", err);
      }
    };

    getData();
  }, [params]);

  return (
    <div>
      <Navbar props="bg-white mb-5" />
      <div className="w-11/12 mx-auto space-y-6">
        {/* Progress Tracker */}
        <div className="bg-white p-5 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Status Pesanan
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {stages.map((stage, index) => (
              <div key={index} className="flex items-center gap-3">
                {index <= currentStage ? (
                  index === currentStage ? (
                    <Circle className="text-yellow-400 w-6 h-6" />
                  ) : (
                    <CheckCircle className="text-green-600 w-6 h-6" />
                  )
                ) : index <= currentStage ? (
                  <CheckCircle className="text-green-600 w-6 h-6" />
                ) : (
                  <Circle className="text-gray-400 w-6 h-6" />
                )}

                <p
                  className={cn(
                    "text-sm sm:text-base",
                    index <= currentStage
                      ? "font-semibold text-gray-900"
                      : "text-gray-500"
                  )}
                >
                  {stage}
                </p>
                {index < stages.length - 1 && (
                  <div className="hidden sm:block w-12 h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">Detail Pesanan</h2>
            <div className="grid grid-cols-2 gap-3 text-sm sm:text-base">
              {[...Array(10)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-5 w-full rounded-md bg-gray-200"
                />
              ))}
            </div>
          </div>
        ) : (
          transactionData && (
            <div className="bg-white p-5 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">Detail Pesanan</h2>
              <div className="grid grid-cols-2 gap-3 text-sm sm:text-base">
                <p className="text-gray-600">Nama Produk:</p>
                <p className="font-medium">{transactionData.documentName}</p>

                <p className="text-gray-600">Jumlah Lembar:</p>
                <p className="font-medium">{transactionData.sheetCount}</p>

                <p className="text-gray-600">Jenis Kertas:</p>
                <p className="font-medium">{transactionData.paperType}</p>

                <p className="text-gray-600">Finishing:</p>
                <p className="font-medium">{transactionData.finishing}</p>

                <p className="text-gray-600">Jumlah:</p>
                <p className="font-medium">{transactionData.quantity} pcs</p>

                <p className="text-gray-600">Tipe Cetak:</p>
                <p className="font-medium">{transactionData.printType}</p>

                <p className="text-gray-600">Total Harga:</p>
                <p className="font-semibold text-green-600">
                  Rp {transactionData.totalPrice.toLocaleString("id-ID")}
                </p>

                <p className="text-gray-600">Status Pembayaran:</p>
                <p
                  className={`font-medium ${
                    transactionData.paymentStatus
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {transactionData.paymentStatus
                    ? "Sudah Dibayar"
                    : "Belum Dibayar"}
                </p>

                <p className="text-gray-600">Tanggal Pemesanan:</p>
                <p className="font-medium">{transactionData.orderDate}</p>
              </div>
            </div>
          )
        )}

        {/* Pickup Information */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">
            🏪 Informasi Pengambilan
          </h2>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              Pesanan dapat diambil di{" "}
              <span className="font-semibold text-gray-900">
                Toko Rizki Putra
              </span>
            </p>

            <div className="flex items-center gap-3 mt-3">
              <div className="bg-green-500 p-2 rounded-full text-white">
                <MapPinned className="w-5 h-5" />
              </div>
              <p className="text-gray-800 text-sm">
                Jl. Perjuangan, gg. Alam Segar 2 No.2, Sempaja Sel., Kec.
                Samarinda Utara, Kota Samarinda, Kalimantan Timur 75117{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
