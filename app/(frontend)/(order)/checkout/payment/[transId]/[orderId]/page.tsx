"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/exNavbar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePaymentInstruction } from "@/hooks/how-to-pay.store";
import { getVaNumber } from "@/app/(frontend)/action/action";
import { Skeleton } from "@/components/ui/skeleton";

import { useRouter } from "next/navigation";

interface VirtualAccountNumber {
  vaNumber: string;
  bank: string;
  expiryTime: string;
  totalPayment: string;
}

interface SSEStatus {
  message: string;
  status: string;
}

export default function Page({
  params,
}: {
  params: Promise<{ transId: string; orderId: string }>;
}) {
  const router = useRouter();
  // SSE
  const [notification, setNotification] = useState<SSEStatus>();

  const getPaymentInstruction = usePaymentInstruction(
    (state) => state.getPaymentInstruction
  );
  const neededPaymentInstruction = usePaymentInstruction(
    (state) => state.neededPaymentInstruction
  );
  const [virtualAccountNumber, setVirtualAccountNumber] =
    useState<VirtualAccountNumber | null>(null);

  useEffect(() => {
    const getParams = async () => {
      try {
        const { transId, orderId } = await params;
        const data = await getVaNumber(orderId, transId);
        setVirtualAccountNumber(data);
      } catch (error) {
        console.error("Error getting params:", error);
      }
    };
    getPaymentInstruction(virtualAccountNumber?.bank as string);
    getParams();

    const eventSource = new EventSource("/api/v1/sse");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotification(data);
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [params, neededPaymentInstruction]);

  if (notification?.status == "true") {
    router.push("/home");
  }

  return (
    <div>
      <Navbar props={"bg-white mb-5"} />
      <div className="flex flex-col">
        <div className="bg-white lg:w-1/3 md:w-2/3 w-full mx-auto p-5 space-y-6">
          <div>
            <p className="text-center font-bold text-xl">
              Selesaikan Pembayaran Sebelum
            </p>
            {virtualAccountNumber ? (
              <p className="text-red-500 font-semibold text-center text-2xl">
                {virtualAccountNumber.expiryTime}
              </p>
            ) : (
              <div className="flex justify-center">
                <Skeleton className="h-6 w-48" />
              </div>
            )}
          </div>

          {virtualAccountNumber ? (
            <p className="font-semibold text-md">
              {" "}
              {virtualAccountNumber.bank.toUpperCase()} Virtual Account
            </p>
          ) : (
            <div>
              <Skeleton className="h-5 w-40" />
            </div>
          )}

          <div>
            <p className="font-thin text-sm">Nomor Virtual Account</p>
            {virtualAccountNumber ? (
              <p className="text-lg font-semibold">
                {virtualAccountNumber.vaNumber}
              </p>
            ) : (
              <div>
                <Skeleton className="h-6 w-56" />
              </div>
            )}
          </div>

          <div>
            <p className="font-thin text-sm">Total Belanjaan</p>
            {virtualAccountNumber ? (
              <p className="text-lg font-semibold">
                {virtualAccountNumber.totalPayment}
              </p>
            ) : (
              <div>
                <Skeleton className="h-6 w-32" />
              </div>
            )}
          </div>

          <div className="flex flex-row gap-2">
            <Button className="w-full" variant="outline">
              Cek Status Pembayaran
            </Button>
            <Button className="w-full">Pesan lagi</Button>
          </div>

          <Separator />

          <div>
            <p>Cara Pembayaran</p>
            {neededPaymentInstruction ? (
              <Accordion type="single" collapsible>
                {neededPaymentInstruction.methods.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>
                      <p className="text-md font-medium">{item.type}</p>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 ps-3">
                      {item.steps.map((step, stepIndex) => (
                        <p key={stepIndex}>
                          {stepIndex + 1}. {step}
                        </p>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-6 w-48" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
