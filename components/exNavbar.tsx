"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    LogoutButtonMobile,
    LogoutButtonDekstop,
} from "@/components/logoutButton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Hook baru kita
import { useSafeLogin } from "@/hooks/use-safe-login";

import {
    Menu,
    Home,
    User,
    Bell,
    Settings,
    Loader2,
    LogIn,
    ShoppingCart,
    Package,
    FileText,
} from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const desktopMenuItems = [
    { label: "Home", href: "/home" },
    { label: "Pesan Sekarang", href: "/order" },
    { label: "Lacak Pesanan", href: "/transaction" },
];

const mobileMenuItems = [
    { label: "Home", icon: Home, href: "/home" },
    { label: "Pesan Sekarang", icon: Package, href: "/order" },
    { label: "Lacak Pesanan", icon: FileText, href: "/transaction" },
    { label: "Keranjang", icon: ShoppingCart, href: "/chart" },
];

const userMenuItems = [
    { label: "Profil Saya", href: "/profile" },
    { label: "Pengaturan Akun", href: "/account" },
];

const NavActionsSkeleton = () => (
    <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
    </div>
);

const MobileNavActionsSkeleton = () => <Skeleton className="h-10 w-full" />;

export default function Navbar({ props }: { props?: string }) {
    const [loading, setLoading] = useState(false); // Untuk tombol login
    const pathname = usePathname();
    const router = useRouter();

    const { isLogin, userName, userEmail, isLoading } = useSafeLogin();

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60",
                props
            )}
        >
            {/* === DESKTOP NAV === */}
            <div className="container-fluid max-w-7xl mx-auto hidden h-20 items-center justify-between px-4 md:px-6 lg:flex">
                {/* Bagian Kiri: Logo & Navigasi */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/home"
                        className="flex items-center gap-2 font-bold"
                    >
                        <Image
                            src={"/logo.png"}
                            alt="PrintKampus Logo"
                            width={40}
                            height={40}
                        />
                        <span className="text-xl">PrintKampus</span>
                    </Link>
                    <Separator orientation="vertical" className="h-6" />
                    <nav className="flex items-center gap-4">
                        {desktopMenuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "text-md font-medium text-muted-foreground transition-colors hover:text-primary",
                                    pathname === item.href && "text-primary"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Bagian Kanan: Aksi & Profil */}
                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <NavActionsSkeleton />
                    ) : isLogin ? (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push("/chart")}
                                aria-label="Keranjang"
                            >
                                <ShoppingCart />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Notifikasi"
                                    >
                                        <Bell />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-80"
                                >
                                    <DropdownMenuLabel>
                                        Notifikasi
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        Belum ada notifikasi baru.
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-10 w-10 rounded-full"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>
                                                {userName
                                                    ? userName
                                                          .charAt(0)
                                                          .toUpperCase()
                                                    : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                    forceMount
                                >
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {userName}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {userEmail}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {userMenuItems.map((item) => (
                                        <DropdownMenuItem
                                            key={item.label}
                                            onClick={() =>
                                                router.push(item.href)
                                            }
                                        >
                                            {item.label}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <LogoutButtonDekstop props="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-destructive outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full" />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        // Tombol Login jika belum login
                        <Button onClick={() => router.push("/login")}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Login
                        </Button>
                    )}
                </div>
            </div>

            {/* === MOBILE NAV (Sheet) === */}
            <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:hidden">
                <Link
                    href="/home"
                    className="flex items-center gap-2 font-bold"
                >
                    <Image
                        src={"/logo.png"}
                        alt="EzPrint Logo"
                        width={32}
                        height={32}
                    />
                    <span className="text-lg">PrintKampus</span>
                </Link>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Buka menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle>
                                <Link
                                    href="/home"
                                    className="flex items-center gap-2 font-bold"
                                >
                                    <Image
                                        src={"/logo.png"}
                                        alt="EzPrint Logo"
                                        width={32}
                                        height={32}
                                    />
                                    <span className="text-lg">PrintKampus</span>
                                </Link>
                            </SheetTitle>
                            {!isLoading && isLogin && (
                                <SheetDescription className="text-left pt-2">
                                    Selamat datang,{" "}
                                    <span className="font-semibold">
                                        {userName}
                                    </span>
                                </SheetDescription>
                            )}
                        </SheetHeader>

                        <nav className="flex-1 space-y-2 p-4">
                            {mobileMenuItems.map((item) => (
                                <Button
                                    key={item.label}
                                    variant={
                                        pathname === item.href
                                            ? "secondary"
                                            : "ghost"
                                    }
                                    className="w-full justify-start gap-3"
                                    onClick={() => router.push(item.href)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Button>
                            ))}
                        </nav>

                        {!isLoading && isLogin && (
                            <div className="p-4 border-t">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3"
                                    onClick={() => router.push("/profile")}
                                >
                                    <User className="h-5 w-5" />
                                    <span>Profil Saya</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3"
                                    onClick={() => router.push("/account")}
                                >
                                    <Settings className="h-5 w-5" />
                                    <span>Pengaturan Akun</span>
                                </Button>
                            </div>
                        )}

                        <SheetFooter className="p-4 border-t">
                            {isLoading ? (
                                <MobileNavActionsSkeleton />
                            ) : isLogin ? (
                                <Button>
                                    <LogoutButtonMobile props="flex flex-row items-center" />
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        setLoading(true);
                                        router.push("/login");
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <LogIn className="mr-2 h-4 w-4" />
                                    )}
                                    Login
                                </Button>
                            )}
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
