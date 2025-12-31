import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

interface Detail {
    type: string;
    price: number;
}

interface Model {
    constant: number;
    coeffImpresi: number;
    coeffWarna: number;
    coeffSisi: number;
    coeffJilid: number;
}

interface PriceSimulation {
    sheet: number | undefined;

    paperType: Detail[];
    finishingOption: Detail[];
    printingType: Detail[];
    inkType: Detail[];

    predictionModel: Model | undefined;
    predictionTime: number;

    isLoading: boolean;
    price: number | undefined;
    checkoutPrice: number | undefined;
    lastFetched: number;

    fetchPricingData: () => Promise<void>;
    setPrice: (
        sheet: number,
        paperPrice: number,
        inkPrice: number,
        finishingPrice: number
    ) => void;
    setPrediction: (
        impresi: number,
        colors: number,
        sisi: number,
        jilid: number
    ) => void;
    setCheckout: (
        sheet: number,
        paperPrice: number,
        finishingPrice: number,
        quantity: number,
        inkPrice: number
    ) => void;
}

export const useSimulation = create<PriceSimulation>()(
    persist(
        (set, get) => ({
            sheet: undefined,
            paperType: [],
            finishingOption: [],
            printingType: [],
            inkType: [],

            predictionModel: undefined,
            predictionTime: 0,

            isLoading: false,
            price: undefined,
            checkoutPrice: undefined,
            lastFetched: 0,

            fetchPricingData: async () => {
                const now = Date.now();
                const ONE_HOUR = 60 * 60 * 1000;

                if (
                    get().paperType.length > 0 &&
                    now - get().lastFetched < ONE_HOUR
                ) {
                    return;
                }

                set({ isLoading: true });
                try {
                    const response = await axios.get(
                        "/api/v1/order/pricing-options"
                    );

                    if (response.data.status === 200) {
                        const {
                            paperGsm,
                            finishingOption,
                            printingType,
                            inkType,
                            predictionModel,
                        } = response.data.data;

                        set({
                            paperType: paperGsm.map((item: any) => ({
                                type: item.gsm,
                                price: item.price,
                            })),
                            finishingOption: finishingOption.map(
                                (item: any) => ({
                                    type: item.finishingType,
                                    price: item.price,
                                })
                            ),
                            printingType: printingType.map((item: any) => ({
                                type: item.printingType,
                                price: item.price,
                            })),
                            inkType: inkType.map((item: any) => ({
                                type: item.InkType,
                                price: item.price,
                            })),
                            predictionModel: predictionModel,
                            lastFetched: now,
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch pricing options:", error);
                } finally {
                    set({ isLoading: false });
                }
            },

            setPrice: (sheet, paperPrice, inkPrice, finishingPrice) => {
                const total = sheet * (paperPrice + inkPrice) + finishingPrice;
                set(() => ({ price: total }));
            },

            setPrediction: (impresi, colors, sisi, jilid) => {
                const model = get().predictionModel;

                if (!model) {
                    console.warn("Prediction model is not loaded yet");
                    return;
                }

                const estimatedTime =
                    model.constant +
                    model.coeffImpresi * impresi +
                    model.coeffWarna * colors +
                    model.coeffSisi * sisi +
                    model.coeffJilid * jilid;

                set({ predictionTime: Math.ceil(estimatedTime) });
            },
            
            setCheckout: (
                sheet,
                paperPrice,
                finishingPrice,
                quantity,
                inkPrice
            ) => {
                const pricePerSet =
                    sheet * (paperPrice + inkPrice) + finishingPrice;
                const totalPrice = pricePerSet * quantity;
                set(() => ({ checkoutPrice: totalPrice }));
            },
        }),
        {
            name: "price-simulation-storage",
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                paperType: state.paperType,
                finishingOption: state.finishingOption,
                printingType: state.printingType,
                inkType: state.inkType,
                lastFetched: state.lastFetched,
            }),
        }
    )
);
