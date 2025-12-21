"use client";

import toast from "react-hot-toast";
import Navbar from "@/components/exNavbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useRouter } from "next/navigation";
import { useSimulation } from "@/hooks/price-simulation.store";
import { useState } from "react";

import { useLogin } from "@/hooks/user-store";

import { createCheckout, uploadFileCheckout } from "../../action/action";

const priceSimulationSchema = z.object({
  sheetCount: z
    .number({ required_error: "Sheet count is required" })
    .min(1, "Must be at least 1"),
  paperType: z
    .string({ required_error: "Jenis kertas is required" })
    .nonempty("Jenis kertas is required"),
  finishing: z
    .string({ required_error: "Finishing option is required" })
    .nonempty("Finishing option is required"),
  printingType: z
    .string({ required_error: "Jenis print is required" })
    .nonempty("Jenis print is required"),
  quantity: z
    .number({ required_error: "Jumlah rangkap is required" })
    .min(1, "Pembelian minimal 1 rangkap"),
});

type PriceSimulationForm = z.infer<typeof priceSimulationSchema>;

export default function Page() {
  const [isLoadingWhileUploading, setIsLoadingWhileUploading] = useState(false);
  const [isSuccessUploadingFile, setIsSuccessUploadingFile] = useState(false);
  const [isSuccessCheckout, setisSuccessCheckout] = useState(false);
  const token = useLogin((state) => state.token);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [orderId, setOrderId] = useState("");
  const paperType = useSimulation((state) => state.paperType);
  const finishingOption = useSimulation((state) => state.finishingOption);
  const setPrice = useSimulation((state) => state.setCheckout);
  const printingType = useSimulation((state) => state.printingType);
  const calculatedPrice = useSimulation((state) => state.checkoutPrice);
  const router = useRouter();

  const form = useForm<PriceSimulationForm>({
    resolver: zodResolver(priceSimulationSchema),
    defaultValues: {
      sheetCount: undefined,
      paperType: "",
      finishing: "",
      printingType: "",
      quantity: 1,
    },
  });

  const onSubmit = async (data: PriceSimulationForm) => {
    const selectedPaper = paperType.find((p) => p.type === data.paperType);
    const selectedFinishing = finishingOption.find(
      (f) => f.type === data.finishing
    );

    if (selectedPaper && selectedFinishing) {
      // setPrice(
      //   data.sheetCount,
      //   selectedPaper.price,
      //   selectedFinishing.price,
      //   data.quantity
      // );
    }

    try {
      if (selectedFile) {
        toast.loading("Uploading file...");
        setIsLoadingWhileUploading(true);
        const checkout = await uploadFileCheckout(
          selectedFile,
          token as string
        );
        setOrderId(checkout.id);
      }

      toast.dismiss();
      setIsLoadingWhileUploading(false);
      setIsSuccessUploadingFile(true);
      toast.success("Berhasil upload file");
    } catch (err: unknown) {
      toast.dismiss();
      setIsLoadingWhileUploading(false);
      toast.error(
        err instanceof Error ? err.message : "Unexpected server error"
      );
    }
  };

  const handleCheckout = async () => {
    try {
      setisSuccessCheckout(true);
      const data = await createCheckout(
        {
          fieldId: orderId,
          sheetCount: form.getValues("sheetCount"),
          paperType: form.getValues("paperType"),
          finishing: form.getValues("finishing"),
          quantity: form.getValues("quantity"),
          printType: form.getValues("printingType"),
          totalPrice: calculatedPrice,
        },
        token as string
      );

      router.push(`/checkout/${data.id}`);
      setisSuccessCheckout(false);
    } catch (err: unknown) {
      toast.dismiss();
      setisSuccessCheckout(false);
      toast.error(
        err instanceof Error ? err.message : "Unexpected server error"
      );
    }
  };

  return (
    <div className="overflow-x-hidden">
      <Navbar props="bg-white mb-3 shadow-md" />
      <div className="bg-white py-4">
        <p className="text-lg font-semibold text-center text-slate-700">
          Buat Pesanan
        </p>
      </div>
      <div className=" flex flex-col lg:flex-row justify-center gap-2 w-full space-y-8 py-3 ">
        <div className="w-full lg:mx-5">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-2xl shadow-lg space-y-6"
          >
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                Jumlah Halaman
              </label>
              <input
                required
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
              <Controller
                control={form.control}
                name="paperType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kertas" />
                    </SelectTrigger>
                    <SelectContent>
                      {paperType.map((item, index) => (
                        <SelectItem key={index} value={item.type}>
                          {item.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
              <Controller
                control={form.control}
                name="finishing"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih finishing" />
                    </SelectTrigger>
                    <SelectContent>
                      {finishingOption.map((item, index) => (
                        <SelectItem key={index} value={item.type}>
                          {item.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.finishing && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.finishing.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-2">
                Print duplex atau simplex
              </label>
              <Controller
                control={form.control}
                name="printingType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe print" />
                    </SelectTrigger>
                    <SelectContent>
                      {printingType.map((item, index) => (
                        <SelectItem key={index} value={item.type}>
                          {item.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.printingType && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.printingType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-2">
                Jumlah Rangkap
              </label>
              <input
                type="number"
                placeholder="Enter quantity"
                {...form.register("quantity", { valueAsNumber: true })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <input
              required
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />

            {isSuccessUploadingFile ? (
              <Button type="submit" className="w-full" disabled>
                Submit
              </Button>
            ) : (
              <Button type="submit" className="w-full">
                {isLoadingWhileUploading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </form>
        </div>

        <div className="max-w-lg w-full flex flex-col justify-center h-fit">
          <div className="me-5 bg-white p-4 rounded-xl shadow-md">
            <p className="text-lg font-semibold pt-2 ps-2">Metode Pengiriman</p>

            <div className="p-2 mt-2 border border-blue-500 bg-blue-100 rounded-lg cursor-pointer">
              <p className="text-blue-700 font-medium">✔ Ambil di Toko</p>
            </div>

            <div className="p-2 mt-2 bg-gray-100 text-gray-400 rounded-lg opacity-50 cursor-not-allowed">
              <p>🚫 GoSend (Coming Soon)</p>
            </div>

            <div className="p-2 mt-2 bg-gray-100 text-gray-400 rounded-lg opacity-50 cursor-not-allowed">
              <p>🚫 Grab (Coming Soon)</p>
            </div>
          </div>

          <div className="me-5 bg-white p-4 rounded-xl shadow-md text-center flex flex-col justify-center items-center space-y-3 mt-5">
            <h2 className="text-lg font-bold text-gray-700">
              Calculation Result
            </h2>
            <p className="text-gray-600">Total Price:</p>
            <p className="text-xl font-bold text-gray-800">
              Rp.{(calculatedPrice && calculatedPrice) || "0"}
            </p>
            {isSuccessUploadingFile ? (
              <div className="flex flex-row w-full gap-3 pt-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleCheckout}
                >
                  Masukan Keranjang
                </Button>
                <Button className="w-full" onClick={handleCheckout}>
                  {isSuccessCheckout ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Checkout"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-row w-full gap-3 pt-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleCheckout}
                  disabled
                >
                  Masukan Keranjang
                </Button>
                <Button className="w-full" onClick={handleCheckout} disabled>
                  Checkout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
