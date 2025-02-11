"use client";

import Navbar from "@/components/exNavbar";
import {
  getTransaction,
  handleBankCheckout,
} from "@/app/(frontend)/action/action";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

interface TransactionInterfaceDetail {
  totalSheet: number;
  totalPayment: string;
  paperType: string;
  quantity: number;
  documentName: string;
  username: string;
  phoneNumber: string;
  printType: string;
}

interface PaymentPageProps {
  params: {
    id: string;
  };
}


export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isCheckout, setIsCheckout] = useState(false);
  const [bank, setBank] = useState("");
  const [transaction, setTransaction] = useState<TransactionInterfaceDetail>();
  const [orderId, setOrderId] = useState("");
  const handleSelectChange = (value: string) => {
    setBank(value);
  };
  useEffect(() => {
    const fetchTransaction = async () => {
      const id = (await params).id;
      setOrderId(id);
      try {
        if (orderId) {
          const data = await getTransaction(orderId);
          setTransaction(data);
        }
      } catch (err) {
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchTransaction();
    if (!transaction) {
      setIsLoading(false);
    }
  }, [orderId]);

  const onClickBankPayment = async (bank: string) => {
    const paymentType =
      bank == "mandiri"
        ? "echannel"
        : bank === "permata"
        ? "permata"
        : "bank_transfer";
    try {
      setIsCheckout(true);
      const response = await handleBankCheckout(orderId, bank, paymentType);
      const newLink = `/checkout/payment/${response.transaction_id}/${response.oderId}`;
      router.push(newLink);
      setIsCheckout(false);
    } catch (err: unknown) {
      setIsCheckout(false);

      toast.error(
        err instanceof Error ? err.message : "Unexpected server error"
      );
    }
  };

  return (
    <div>
      <Navbar props="bg-white" />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse gap-4 mt-5">
        <div className="basis-1/3 border rounded-md bg-white p-4 h-fit">
          <p className="text-center text-lg font-semibold mb-5">
            Detail produk
          </p>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">Total Halaman</td>
                <td className="py-2">
                  : {transaction ? (
                    `${transaction.totalSheet} Halaman`
                  ) : (
                    <Skeleton className="h-4 w-24 mx-auto" />
                  )}
                </td>
              </tr>

              <tr className="border-b bg-gray-50">
                <td className="py-2 font-medium">Jenis Kertas</td>
                <td className="py-2">
                  : {transaction ? (
                    transaction.paperType
                  ) : (
                    <Skeleton className="h-4 w-20 mx-auto" />
                  )}
                </td>
              </tr>

              <tr className="border-b">
                <td className="py-2 font-medium">Jenis Print</td>
                <td className="py-2">
                  : {transaction ? (
                    transaction.printType
                  ) : (
                    <Skeleton className="h-4 w-20 mx-auto" />
                  )}
                </td>
              </tr>

              <tr className="border-b bg-gray-50">
                <td className="py-2 font-medium">Nama Pembeli</td>
                <td className="py-2">
                  : {transaction ? (
                    transaction.username
                  ) : (
                    <Skeleton className="h-4 w-28 mx-auto" />
                  )}
                </td>
              </tr>

              <tr className="border-b">
                <td className="py-2 font-medium">Nomor Telepon</td>
                <td className="py-2">
                  : {transaction ? (
                    transaction.phoneNumber || "-"
                  ) : (
                    <Skeleton className="h-4 w-20 mx-auto" />
                  )}
                </td>
              </tr>

              <tr className="border-b bg-gray-50">
                <td className="py-2 font-medium">Judul Dokumen</td>
                <td className="py-2">
                  : {transaction ? (
                    transaction.documentName
                  ) : (
                    <Skeleton className="h-4 w-28 mx-auto" />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <Separator className="mb-3" />
          <p className="font-medium text-md">
            Total: {transaction?.totalPayment}
          </p>
          <Separator className="mb-3" />
        </div>
        <div className="basis-2/3 border rounded-md bg-white p-4 h-fit">
          <p className="text-center text-lg font-semibold mb-5">
            Detail Pembayaran:
          </p>
          {/* <p>Amount: {transaction?.totalPrice || "Loading..."}</p>
          <p>Payment Type: {transaction?.paymentType || "Loading..."}</p> */}
          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="item-1">
              <AccordionTrigger className="bg-black text-white px-3 rounded-xl">
                Bank Transfer
              </AccordionTrigger>
              <AccordionContent className="mx-4">
                <div className="mt-3">
                  <Label className="font-bold">Choose Bank</Label>
                </div>
                <div className="mt-3 flex flex-row items-center">
                  <Select value={bank} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select a Bank</SelectLabel>
                        <SelectItem value="bca">BCA</SelectItem>
                        <SelectItem value="bri">BRI</SelectItem>
                        <SelectItem value="bni">BNI</SelectItem>
                        <SelectItem value="permata">Permata</SelectItem>
                        <SelectItem value="cimb">CIMB</SelectItem>
                        <SelectItem value="mandiri">MANDIRI</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {bank ? (
                  <Button
                    className="w-full mt-5"
                    onClick={() => onClickBankPayment(bank)}
                  >
                    {isCheckout ? (
                      <div className="flex flex-row">
                        <Loader2 className="animate-spin" /> <p>Please Wait</p>
                      </div>
                    ) : (
                      "Checkout"
                    )}
                  </Button>
                ) : (
                  <Button className="w-full mt-5" disabled>
                    Checkout
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="bg-black text-white px-3 rounded-xl">
                E-wallet
              </AccordionTrigger>
              <AccordionContent className="mx-4">
                <div className="mt-3">
                  <Label className="font-bold">Choose E-wallet</Label>
                </div>
                <div className="mt-3 flex flex-row items-center">
                  <Select value={bank} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select e-wallet provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select e-wallet provider</SelectLabel>
                        <SelectItem value="qris">QRIS</SelectItem>
                        <SelectItem value="gopay">Gopay</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
