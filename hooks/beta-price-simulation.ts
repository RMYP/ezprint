import { create } from "zustand";

interface Detail {
    type: string;
    price: number;
}

interface PriceSimulation {
    paperType: Detail[];
    finishingOption: Detail[];
    printingType: Detail[];
    inkType: Detail[];
    price: number | undefined; // Untuk tampilan simulasi
    checkoutPrice: number | undefined; // Untuk nilai final checkout
    // Satu fungsi kalkulasi utama yang fleksibel
    calculatePrice: (data: {
        sheet: number;
        quantity: number;
        paperPrice: number;
        inkPrice: number;
        finishingPrice: number;
        printTypePrice: number;
    }) => void;
}

export const useSimulation = create<PriceSimulation>((set) => ({
    paperType: [
        { type: "75gsm", price: 100 },
        { type: "80gsm", price: 150 },
    ],
    finishingOption: [
        { type: "Tanpa Jilid", price: 0 },
        { type: "Jilid Soft Cover", price: 6000 },
        { type: "Staples", price: 0 },
        { type: "Binder Clip", price: 3000 },
    ],
    printingType: [
        { type: "Cetak Satu Sisi (simplex)", price: 0 },
        { type: "Cetak Dua Sisi (duplex)", price: 0 },
    ],
    inkType: [
        { type: "Hitam Putih", price: 200 },
        { type: "Warna", price: 350 },
    ],
    price: undefined,
    checkoutPrice: undefined,

    calculatePrice: (data) => {
        const costPerSheet = data.paperPrice + data.inkPrice + data.printTypePrice;
        const costPerExemplar = (costPerSheet * data.sheet) + data.finishingPrice;
        const total = costPerExemplar * data.quantity;

        set({ price: total, checkoutPrice: total });
    },
}));