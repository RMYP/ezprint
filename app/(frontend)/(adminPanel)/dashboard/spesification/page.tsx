"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasterDataCard, MasterItem } from "@/components/master-data-card";
import {
    getSpecifications,
    saveSpecification,
} from "@/app/(frontend)/action/action";
import { toast } from "react-hot-toast";

export default function MasterDataPage() {
    const [papers, setPapers] = useState<MasterItem[]>([]);
    const [inks, setInks] = useState<MasterItem[]>([]);
    const [finishings, setFinishings] = useState<MasterItem[]>([]);
    const [prints, setPrints] = useState<MasterItem[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getSpecifications();

            setPapers(
                data.paperGsm.map((item) => ({
                    id: item.id,
                    name: item.gsm, 
                    price: item.price,
                }))
            );

            setInks(
                data.inkType.map((item) => ({
                    id: item.id,
                    name: item.InkType, 
                    price: item.price,
                }))
            );

            setFinishings(
                data.finishingOption.map((item) => ({
                    id: item.id,
                    name: item.finishingType,
                    price: item.price,
                }))
            );

            setPrints(
                data.printingType.map((item) => ({
                    id: item.id,
                    name: item.printingType,
                    price: item.price,
                }))
            );
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data spesifikasi.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleSavePaper = async (item: MasterItem, isEdit: boolean) => {
        const payload = isEdit
            ? { id: item.id, gsm: item.name, price: item.price }
            : { gsm: item.name, price: item.price };

            console.log(payload)
        await saveSpecification(
            "paper-gsm",
            isEdit ? "update" : "create",
            payload
        );
        fetchData();
    };

    const handleSaveInk = async (item: MasterItem, isEdit: boolean) => {
        const payload = isEdit
            ? { id: item.id, InkType: item.name, price: item.price }
            : { InkType: item.name, price: item.price };

        await saveSpecification(
            "inkType",
            isEdit ? "update" : "create",
            payload
        );
        fetchData();
    };

    const handleSaveFinishing = async (item: MasterItem, isEdit: boolean) => {
        const payload = isEdit
            ? { id: item.id, finishingType: item.name, price: item.price }
            : { finishingType: item.name, price: item.price };

        await saveSpecification(
            "finishing-option",
            isEdit ? "update" : "create",
            payload
        );
        fetchData();
    };

    const handleSavePrint = async (item: MasterItem, isEdit: boolean) => {
        const payload = isEdit
            ? { id: item.id, printingType: item.name, price: item.price }
            : { printingType: item.name, price: item.price };

        await saveSpecification(
            "printing-type",
            isEdit ? "update" : "create",
            payload
        );
        fetchData();
    };

    const handleDeletePlaceholder = async (id: string) => {
        toast("Fitur hapus belum tersedia di API", {
            icon: "👏",
            style: {
                borderRadius: "10px",
                background: "#333",
                color: "#fff",
            },
        });
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center">Memuat data spesifikasi...</div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-5">
            <Tabs defaultValue="paper" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="paper">Kertas</TabsTrigger>
                    <TabsTrigger value="ink">Tinta</TabsTrigger>
                    <TabsTrigger value="finishing">Finishing</TabsTrigger>
                    <TabsTrigger value="print">Jenis Cetak</TabsTrigger>
                </TabsList>

                <TabsContent value="paper" className="space-y-4">
                    <MasterDataCard
                        title="Daftar Kertas"
                        description="Kelola jenis kertas dan harga per lembar."
                        itemNameLabel="Jenis Kertas (GSM)"
                        data={papers}
                        onSave={handleSavePaper}
                        onDelete={handleDeletePlaceholder}
                    />
                </TabsContent>

                <TabsContent value="ink" className="space-y-4">
                    <MasterDataCard
                        title="Jenis Tinta"
                        description="Atur harga berdasarkan jenis tinta."
                        itemNameLabel="Tipe Tinta"
                        data={inks}
                        onSave={handleSaveInk}
                        onDelete={handleDeletePlaceholder}
                    />
                </TabsContent>

                <TabsContent value="finishing" className="space-y-4">
                    <MasterDataCard
                        title="Opsi Finishing"
                        description="Kelola biaya tambahan finishing."
                        itemNameLabel="Nama Finishing"
                        data={finishings}
                        onSave={handleSaveFinishing}
                        onDelete={handleDeletePlaceholder}
                    />
                </TabsContent>

                <TabsContent value="print" className="space-y-4">
                    <MasterDataCard
                        title="Jenis Cetak"
                        description="Pengaturan harga sisi cetak."
                        itemNameLabel="Tipe Cetak"
                        data={prints}
                        onSave={handleSavePrint}
                        onDelete={handleDeletePlaceholder}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
