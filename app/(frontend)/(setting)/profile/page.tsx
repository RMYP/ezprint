"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLogin } from "@/hooks/user-store"; // Menggunakan store
import { updateUserData, getUserInfo, getChart } from "../../action/action"; // Tambahkan getChart
import {
    Loader2,
    AlertCircle,
    Package,
    Calendar,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
} from "lucide-react"; // Ikon tambahan
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// --- Interface untuk Riwayat Transaksi (dari chart/page.tsx) ---
interface PaymentList {
    id: string;
    transactionId: string;
    orderId: string;
    grossAmount: string;
    paymentType: string;
    transactionTime: string;
    expiryTime: string;
    vaNumber: string;
    bank: string;
    transactionStatus: string;
}

interface ChartList {
    id: string;
    sheetCount: number;
    paperType: string;
    finishing: string;
    quantity: number;
    printType: string;
    totalPrice: string;
    status: string;
    paymentStatus: boolean;
    documentPath: string;
    documentName: string;
    userId: string;
    orderDate: string;
    Payment: PaymentList[];
}

// --- Helper Functions untuk Riwayat Transaksi ---
const formatPrice = (price: string | number) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return price.toString();
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(numericPrice);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const getStatusBadge = (item: ChartList) => {
    if (item.status === "finished") {
        return (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3" />
                Selesai
            </span>
        );
    }
    if (item.status === "deny") {
        return (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1.5">
                <XCircle className="h-3 w-3" />
                Ditolak
            </span>
        );
    }
    if (item.status === "onProgress") {
        return (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Diproses
            </span>
        );
    }
    if (item.Payment?.[0]?.transactionStatus === "pending") {
         return (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Menunggu Pembayaran
            </span>
        );
    }
    return (
        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Belum Checkout
        </span>
    );
};

// --- Komponen Tab Riwayat Transaksi ---
function TransactionHistoryTab() {
    const router = useRouter();
    const [orders, setOrders] = useState<ChartList[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const data = await getChart(); // Mengambil semua order
                setOrders(data);
            } catch (err) {
                console.error("Gagal memuat riwayat transaksi:", err);
                setOrders([]); // Set ke array kosong jika error
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat</CardTitle>
                    <CardDescription>
                        Semua pesanan yang pernah Anda buat.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                </CardContent>
            </Card>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat</CardTitle>
                    <CardDescription>
                        Semua pesanan yang pernah Anda buat.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <FileText size={48} className="text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800">
                            Belum Ada Riwayat Transaksi
                        </h3>
                        <p className="text-gray-500 mt-1">
                            Anda belum pernah melakukan pesanan.
                        </p>
                        <Button
                            className="mt-6"
                            onClick={() => router.push("/orderbeta")}
                        >
                            Buat Pesanan Pertama Anda
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Riwayat</CardTitle>
                <CardDescription>
                    Semua pesanan yang pernah Anda buat.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-gray-200 border-t">
                    {orders.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/status/${item.id}`)}
                        >
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-gray-900 break-all">
                                    {item.documentName}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(item.orderDate)}</span>
                                </p>
                                <div className="pt-1">
                                    {getStatusBadge(item)}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <span className="text-md font-bold text-gray-900 text-right">
                                    {formatPrice(item.totalPrice)}
                                </span>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// --- Komponen Skeleton untuk Riwayat ---
const TransactionSkeleton = () => (
    <div className="flex items-center justify-between p-4 border-b">
        <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-5" />
        </div>
    </div>
);

// --- Komponen Utama Halaman ---
export default function ProfileSettingsPage() {
    const router = useRouter();

    // --- Ambil state secara individual ---
    const userId = useLogin((state) => state.userId);
    const name = useLogin((state) => state.name);
    const email = useLogin((state) => state.email);
    const phoneNum = useLogin((state) => state.phoneNum);
    const refreshToken = useLogin((state) => state.refreshToken);
    
    // State untuk Form Profil
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // State untuk Form Password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Mengisi data user saat komponen dimuat
    useEffect(() => {
        if (name) setUsername(name);
        if (phoneNum) setPhone(phoneNum);
    }, [name, phoneNum]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            setProfileMessage({ type: "error", message: "User tidak terautentikasi." });
            return;
        }

        setIsProfileLoading(true);
        setProfileMessage(null);

        try {
            await updateUserData(username, phone, userId);
            setProfileMessage({ type: "success", message: "Profil berhasil diperbarui!" });
            refreshToken(); // Refresh token & data di zustand
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan.";
            setProfileMessage({ type: "error", message: errorMessage });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        setPasswordMessage(null);

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "error", message: "Konfirmasi password baru tidak cocok." });
            setIsPasswordLoading(false);
            return;
        }

        // TODO: Implementasi logika API untuk ubah password
        console.log("Mengubah password...", { currentPassword, newPassword });
        setTimeout(() => {
            setPasswordMessage({ type: "success", message: "Password berhasil diubah!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setIsPasswordLoading(false);
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold tracking-tight mb-6">
                Pengaturan Akun
            </h2>

            <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-3 max-w-lg">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="security">Keamanan</TabsTrigger>
                    <TabsTrigger value="history">Riwayat</TabsTrigger>
                </TabsList>
                
                {/* --- Tab Konten Profil --- */}
                <TabsContent value="profile">
                    <Card>
                        <form onSubmit={handleUpdateProfile}>
                            <CardHeader>
                                <CardTitle>Profil</CardTitle>
                                <CardDescription>
                                    Kelola informasi profil Anda.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Nama Pengguna</Label>
                                    <Input
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Nama lengkap Anda"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Nomor WA</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email || ""}
                                        disabled
                                        className="cursor-not-allowed bg-muted/50"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <div>
                                    {profileMessage && (
                                        <Alert variant={profileMessage.type === "error" ? "destructive" : "default"} className="py-2 px-3">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {profileMessage.message}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                                <Button type="submit" disabled={isProfileLoading}>
                                    {isProfileLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Simpan Perubahan
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <form onSubmit={handleUpdatePassword}>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>
                                    Ubah password Anda di sini. Disarankan menggunakan password yang kuat.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Password Lama</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Password Baru</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <div>
                                    {passwordMessage && (
                                        <Alert variant={passwordMessage.type === "error" ? "destructive" : "default"} className="py-2 px-3">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {passwordMessage.message}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                                <Button type="submit" disabled={isPasswordLoading}>
                                    {isPasswordLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Ubah Password
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <TransactionHistoryTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}