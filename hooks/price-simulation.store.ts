import { create } from "zustand";

interface Detail {
  type: string;
  price: number;
}

interface PriceSimulation {
  sheet: number | undefined;
  paperType: Detail[];
  finishingOption: Detail[];
  printingType: Detail[];
  price: number | undefined;
  setPrice: (sheet: number, paperPrice: number, finishingPrice: number) => void;
}
export const useSimulation = create<PriceSimulation>((set) => ({
  sheet: undefined,
  paperType: [
    { type: "75gsm", price: 350 },
    { type: "80gsm", price: 400 },
  ],
  finishingOption: [
    { type: "Tanpa Jilid", price: 0 },
    { type: "Jilid Soft Cover", price: 6000 },
    { type: "Staples", price: 0 },
    { type: "Binder Clip", price: 3000 },
  ],
  printingType: [
    { type: "Cetak Satu Sisi", price: 0 },
    { type: "Cetak Dua Sisi (bolak-balik)", price: 0 },
  ],
  price: undefined,
  setPrice: (sheet, paperPrice, finishingPrice) => {
    const total = sheet * paperPrice + finishingPrice;
    set(() => ({ price: total }));
  },
}));
