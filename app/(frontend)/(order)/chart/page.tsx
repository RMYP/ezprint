"use client";

import Image from "next/image";
import Navbar from "@/components/exNavbar";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useSimulation } from "@/hooks/price-simulation.store";

const priceSimulationSchema = z.object({
  sheetCount: z
    .number({ required_error: "Sheet count is required" })
    .min(1, "Must be at least 1"),
  paperType: z.string({ required_error: "Paper type is required" }),
  finishing: z.string({ required_error: "Finishing option is required" }),
});

type PriceSimulationForm = z.infer<typeof priceSimulationSchema>;

export default function Page() {
  const paperType = useSimulation((state) => state.paperType);
  const finishingOption = useSimulation((state) => state.finishingOption);
  const setPrice = useSimulation((state) => state.setPrice);
  const printingType = useSimulation((state) => state.printingType);

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
      <Navbar props="bg-white shadow-md" />
      <div className="w-full lg:mx-5 mb-5  border shadow-md rounded-md flex justify-center">
        <Image src="/books.jpg" alt="Image" height={700} width={600} />
      </div>
      <div className=" bg-white flex flex-col lg:flex-row justify-center gap-5 w-full items-center space-y-8 py-5">
        <div className="w-full">
          <p className="text-lg font-semibold text-center text-slate-700">
            Buat Pesanan
          </p>
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
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                Jenis Print
              </label>
              <select
                // {...form.register("finishing")}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Choose printing type</option>
                {printingType.map((item, index) => (
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
            <button
              type="submit"
              className="w-full text-white font-semibold py-2 rounded-lg hover:bg-blue-700"
            ></button>
          </form>
        </div>
        <div className="max-w-lg w-full justify-center flex">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg text-center">
            <h2 className="text-xl font-bold text-gray-700">
              Calculation Result
            </h2>
            <p className="text-gray-600 mt-4">Total Price:</p>
            <p className="text-2xl font-bold text-gray-800">Rp.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
