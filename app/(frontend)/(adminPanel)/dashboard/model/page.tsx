"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import z from "zod";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    constantInput,
    getModel,
    updateModelStatus,
} from "@/app/(frontend)/action/action";

const inputConstantSchema = z.object({
    modelName: z.string().min(1, "Nama model wajib diisi"),
    constant: z.string().regex(/^-?\d*\.?\d+$/, "Format angka tidak valid"),
    coeffImpresi: z.string().regex(/^-?\d*\.?\d+$/, "Format angka tidak valid"),
    coeffWarna: z.string().regex(/^-?\d*\.?\d+$/, "Format angka tidak valid"),
    coeffSisi: z.string().regex(/^-?\d*\.?\d+$/, "Format angka tidak valid"),
    coeffJilid: z.string().regex(/^-?\d*\.?\d+$/, "Format angka tidak valid"),
});

interface constantInput {
    id: string;
    modelName: string;
    constant: number;
    coeffImpresi: number;
    coeffWarna: number;
    coeffSisi: number;
    coeffJilid: number;
    isActive: boolean;
    createdAt: Date;
}

export default function PredictionModelPage() {
    const [activeTab, setActiveTab] = useState("history");
    const [model, setModel] = useState<constantInput[]>([]);
    const [updateStatus, setUpdateStatus] = useState(false);
    const [modelId, setModelId] = useState("");

    const form = useForm<z.infer<typeof inputConstantSchema>>({
        resolver: zodResolver(inputConstantSchema),
        defaultValues: {
            modelName: "",
            constant: "",
            coeffImpresi: "",
            coeffWarna: "",
            coeffSisi: "",
            coeffJilid: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof inputConstantSchema>) => {
        const loadingToast = toast.loading("Menyimpan model baru...");
        try {
            const payload = {
                modelName: values.modelName,
                constant: parseFloat(values.constant),
                coeffImpresi: parseFloat(values.coeffImpresi),
                coeffWarna: parseFloat(values.coeffWarna),
                coeffSisi: parseFloat(values.coeffSisi),
                coeffJilid: parseFloat(values.coeffJilid),
            };
            const response = await constantInput(payload);

            console.log(response);
            if (response.success) {
                toast.success("Model berhasil disimpan dan diaktifkan!", {
                    id: loadingToast,
                });
                form.reset();
                setActiveTab("history");
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            toast.error("Gagal menyimpan model", { id: loadingToast });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getModel();
                setModel(response.data);
                if (!response.success) toast.error(response.message);
            } catch (err) {
                toast.error("Gagal mengambil model");
            }
        };

        const updateModel = async () => {
            try {
                const response = await updateModelStatus(modelId);
                if (response.success) {
                    setUpdateStatus(false);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                toast.error("Gagal mengambil model");
            }
        };

        fetchData();
        if (updateStatus) {
            updateModel();
        }
        return;
    }, [updateStatus]);

    return (
        <div className="p-8 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings2 className="text-blue-600" />
                        Konfigurasi Model Prediksi
                    </h1>
                    <p className="text-gray-500">
                        Kelola koefisien hasil training regresi untuk estimasi
                        waktu pengerjaan.
                    </p>
                </header>

                {/* Tab Selector */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            activeTab === "history"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-600 border"
                        }`}
                    >
                        Riwayat Model
                    </button>
                    <button
                        onClick={() => setActiveTab("new")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            activeTab === "new"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-600 border"
                        }`}
                    >
                        + Input Model Baru
                    </button>
                </div>

                {activeTab === "new" ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">
                            Detail Hasil Training Lokal
                        </h2>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Field Nama Model */}
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="modelName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Nama Model
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Contoh: Model Regresi v2"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Field Konstanta */}
                                    <FormField
                                        control={form.control}
                                        name="constant"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    constant (a)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="-257.20"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Field coeffImpresi */}
                                    <FormField
                                        control={form.control}
                                        name="coeffImpresi"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    coeff_Impresi (coeffImpresi)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="14.41"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Field coeffWarna */}
                                    <FormField
                                        control={form.control}
                                        name="coeffWarna"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    coeff_ColorType (coeffWarna)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="5.2"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Field coeffSisi */}
                                    <FormField
                                        control={form.control}
                                        name="coeffSisi"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    coeff_PrintType (coeffSisi)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="120.5"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Field coeffJilid */}
                                    <FormField
                                        control={form.control}
                                        name="coeffJilid"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    coeff_Finishing (coeffJilid)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="120.5"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 px-8"
                                    >
                                        Simpan Model
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                ) : (
                    /* TABEL RIWAYAT MODEL (Sama seperti sebelumnya) */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            {/* ... isi tabel ... */}
                            <tbody className="divide-y divide-gray-100">
                                {model.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-4 text-center text-gray-500 italic"
                                        >
                                            Belum ada riwayat model.
                                        </td>
                                    </tr>
                                ) : (
                                    model.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={
                                                item.isActive
                                                    ? "bg-blue-50/50"
                                                    : ""
                                            }
                                        >
                                            <td className="p-4 font-medium text-sm text-gray-900">
                                                {item.modelName}
                                            </td>
                                            <td className="p-4 text-xs text-gray-600 leading-relaxed">
                                                a: {item.constant.toFixed(4)}{" "}
                                                <br />
                                                b1:{" "}
                                                {item.coeffImpresi.toFixed(4)} |
                                                b2: {item.coeffWarna.toFixed(4)}{" "}
                                                | b3:{" "}
                                                {item.coeffSisi.toFixed(4)} |
                                                b4: {item.coeffJilid.toFixed(4)}
                                            </td>
                                            <td className="p-4 text-xs text-gray-500">
                                                {new Date(
                                                    item.createdAt
                                                ).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="p-4 text-center">
                                                {item.isActive ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center justify-center gap-1 mx-auto w-fit">
                                                        <CheckCircle2
                                                            size={12}
                                                        />{" "}
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs h-7"
                                                        onClick={() => {
                                                            setModelId(item.id);
                                                            setUpdateStatus(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        Aktifkan
                                                    </Button>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-400 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
