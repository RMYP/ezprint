"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast"; 

export interface MasterItem {
    id: string;
    name: string; 
    price: number;
}

interface MasterDataCardProps {
    title: string;
    description: string;
    data: MasterItem[];
    itemNameLabel: string; 
    onSave: (item: MasterItem, isEdit: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function MasterDataCard({
    title,
    description,
    data,
    itemNameLabel,
    onSave,
    onDelete,
}: MasterDataCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<MasterItem>({
        id: "",
        name: "",
        price: 0,
    });
    const [isEditMode, setIsEditMode] = useState(false);

    // Handle Buka Modal untuk Tambah Baru
    const handleAddNew = () => {
        setFormData({ id: "", name: "", price: 0 });
        setIsEditMode(false);
        setIsOpen(true);
    };

    // Handle Buka Modal untuk Edit
    const handleEdit = (item: MasterItem) => {
        setFormData(item);
        setIsEditMode(true);
        setIsOpen(true);
    };

    // Handle Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData, isEditMode);
            setIsOpen(false);
            toast.success(
                `Berhasil ${isEditMode ? "memperbarui" : "menambahkan"} data.`
            );
        } catch (error) {
            toast.error("Terjadi kesalahan.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Delete
    const handleDelete = async (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            try {
                await onDelete(id);
                toast.success("Data berhasil dihapus.");
            } catch (error) {
                toast.error("Gagal menghapus data.");
            }
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <Button onClick={handleAddNew} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Baru
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50%]">
                                {itemNameLabel}
                            </TableHead>
                            <TableHead>Harga (Rp)</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="text-center h-24 text-muted-foreground"
                                >
                                    Belum ada data.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.name}
                                    </TableCell>
                                    <TableCell>
                                        Rp {item.price.toLocaleString("id-ID")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleDelete(item.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Dialog Form (Modal) */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {isEditMode
                                    ? "Edit Spesifikasi"
                                    : "Tambah Spesifikasi Baru"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditMode
                                    ? "Perbarui detail spesifikasi di bawah ini."
                                    : "Masukkan detail spesifikasi baru untuk ditambahkan ke sistem."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{itemNameLabel}</Label>
                                <Input
                                    id="name"
                                    placeholder={`Contoh: ${
                                        itemNameLabel === "Jenis Kertas"
                                            ? "100gsm"
                                            : "Standard"
                                    }`}
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Harga (Rp)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            price: Number(e.target.value),
                                        })
                                    }
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
