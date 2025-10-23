"use client";

import Link from "next/link";
import Image from "next/image";
import { useLogin } from "@/hooks/user-store";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

import {
    Menu,
    Home,
    User,
    Bell,
    Settings,
    Loader2,
    LogIn,
    LogOut,
    ShoppingCart,
    UserRound,
    Package,
    Truck,
    CheckCircle,
    Clock,
} from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Navbar({ props }: { props?: string }) {
    const menuItems = [
        { label: "Home", icon: Home, path: "/home" },
        { label: "My Profile", icon: User, path: "/profile" },
        { label: "Notification", icon: Bell, path: "/notification" },
        { label: "Setting", icon: Settings, path: "/setting" },
    ];

    const lgMenuItems = [
        { label: "Home", icon: Home, path: "/home" },
        { label: "Product", icon: User, path: "/product" },
        { label: "Contact", icon: Bell, path: "/contact" },
        { label: "FAQ", icon: Settings, path: "/faq" },
    ];

    const [loading, setLoading] = useState(false);
    const isLogin = useLogin((state) => state.loginStatus);
    const pathname = usePathname();
    const router = useRouter();
    const getToken = useLogin((state) => state.setToken);

    useEffect(() => {
        getToken();
    }, []);

    return (
        <div className={props}>
            {/* MOBILE NAV */}
            <div>
                <div className="lg:hidden flex py-6 items-center justify-between">
                    <div className="flex items-center ps-3">
                        <Sheet>
                            <SheetTrigger className="p-2">
                                <Menu size={30} />
                            </SheetTrigger>

                            <SheetContent
                                side="left"
                                className="bg-zinc-700 text-white w-2/3 p-6"
                            >
                                <SheetTitle className="hidden">Menu</SheetTitle>
                                <div className="flex flex-col items-center text-center">
                                    <h2 className="text-xl font-semibold mt-2">
                                        Rlexandra
                                    </h2>
                                    <p className="text-sm text-gray-300">
                                        rlexandra@gmail.com
                                    </p>
                                </div>
                                <nav className="mt-6 space-y-4">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.label}
                                            onClick={() =>
                                                router.push(item.path)
                                            }
                                            className={`flex items-center space-x-4 p-2 w-full rounded-lg transition-all 
                        ${pathname === item.path ? "border text-white" : ""}`}
                                        >
                                            <item.icon size={20} />
                                            <span className="text-lg">
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </nav>
                                <div className="absolute bottom-6 left-6 w-[calc(100%-3rem)]">
                                    {isLogin ? (
                                        <Button
                                            variant={"outline"}
                                            onClick={() => {
                                                router.push("logout");
                                            }}
                                            className="bg-transparent text-white w-full"
                                        >
                                            <LogOut size={20} />
                                            <span className="text-lg">
                                                Log Out
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant={"outline"}
                                            onClick={() => {
                                                setLoading(true);
                                                router.push("/login");
                                            }}
                                            className="bg-transparent text-white w-full"
                                        >
                                            {loading ? (
                                                <Loader2 className="animate-spin" />
                                            ) : (
                                                <LogIn size={20} />
                                            )}
                                            <span className="text-lg">
                                                Log In
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <Image
                            src={"/logo.png"}
                            alt="logo"
                            width={50}
                            height={50}
                        />
                    </div>
                </div>
            </div>

            {/* DESKTOP NAV */}
            <header className="hidden lg:flex justify-around p-5 text-black text-lg h-32 items-center">
                <div>
                    <Image
                        src={"/logo.png"}
                        alt="logo"
                        width={65}
                        height={65}
                    />
                </div>

                <div className="flex gap-10">
                    {lgMenuItems.map((item) => (
                        <Link key={item.label} href={item.path}>
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div>
                    {isLogin ? (
                        <div className="pe-5 flex gap-5 items-center">
                            {/* Notification Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
                                        <Bell size={22} />
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                                            3
                                        </span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-[350px] rounded-xl shadow-lg p-0 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b">
                                        <h3 className="text-base font-semibold">
                                            Notifikasi
                                        </h3>
                                        <Settings
                                            size={18}
                                            className="text-gray-500 cursor-pointer"
                                        />
                                    </div>

                                    <Tabs
                                        defaultValue="transaksi"
                                        className="w-full"
                                    >
                                        <TabsList className="grid grid-cols-2 bg-transparent border-b">
                                            <TabsTrigger
                                                value="transaksi"
                                                className="data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none"
                                            >
                                                Transaksi
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="update"
                                                className="data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none"
                                            >
                                                Update
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="transaksi">
                                            <ScrollArea>
                                                <div className="p-4 space-y-4">
                                                    <section>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h4 className="font-semibold">
                                                                Transaksi
                                                            </h4>
                                                            <Button variant={"outline"} className="b">
                                                                <Link
                                                                    className="text-sm text-green-600"
                                                                    href={
                                                                        "/transaction"
                                                                    }
                                                                >
                                                                    Lihat Semua
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </section>
                                                    <section className="pt-3 border-t">
                                                        <h4 className="font-semibold mb-2">
                                                            Penjualan
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mb-3">
                                                            Cek pesanan yang
                                                            masuk dan
                                                            perkembangan tokomu
                                                            secara rutin di satu
                                                            tempat
                                                        </p>
                                                        <button className="w-full border border-green-600 text-green-600 rounded-lg py-1.5 text-sm hover:bg-green-50 transition">
                                                            Masuk ke Seller
                                                            Center
                                                        </button>
                                                    </section>
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>

                                        <TabsContent value="update">
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                Belum ada notifikasi baru.
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Other icons */}
                            <Link href={"/chart"}>
                                <ShoppingCart />
                            </Link>
                            <Link href={"/profile"}>
                                <UserRound />
                            </Link>
                        </div>
                    ) : (
                        <div className="pe-5">
                            <Link
                                href={"/login"}
                                className="flex gap-2 items-center"
                            >
                                <p>Login</p>
                                <LogIn />
                            </Link>
                        </div>
                    )}
                </div>
            </header>
        </div>
    );
}
