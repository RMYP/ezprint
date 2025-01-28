"use client";

import Link from "next/link";
import Image from "next/image";
import { useLogin } from "@/hooks/user-store";
import { useState } from "react";

import { useRouter, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Menu,
  Home,
  User,
  Briefcase,
  MessageCircle,
  Bell,
  Settings,
  Loader2,
  LogIn,
  LogOut,
} from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const menuItems = [
    { label: "Home", icon: Home, path: "/home" },
    { label: "My Profile", icon: User, path: "/profile" },
    { label: "Notification", icon: Bell, path: "/notification" },
    { label: "Setting", icon: Settings, path: "setting" },
  ];

  const [loading, setLoading] = useState(false);
  const isLogin = useLogin((state) => state.loginStatus);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div>
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
                  <h2 className="text-xl font-semibold mt-2">Rlexandra</h2>
                  <p className="text-sm text-gray-300">rlexandra@gmail.com</p>
                </div>
                <nav className="mt-6 space-y-4">
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.path)}
                      className={`flex items-center space-x-4 p-2 w-full rounded-lg transition-all 
                ${pathname === item.path ? "border text-white" : ""}`}
                    >
                      <item.icon size={20} />
                      <span className="text-lg">{item.label}</span>
                    </button>
                  ))}
                </nav>
                <div className="absolute bottom-6 left-6 w-[calc(100%-3rem)]">
                  {isLogin && isLogin ? (
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        router.push("logout");
                      }}
                      className="bg-transparent text-white"
                    >
                      <LogOut size={20} />
                      <span className="text-lg">Log Out</span>
                    </Button>
                  ) : (
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        setLoading(true);
                        router.push("/login");
                        setLoading(false);
                      }}
                      className="bg-transparent text-white"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <LogIn size={20} />
                      )}
                      <LogIn size={20} />
                      <span className="text-lg">Log In</span>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Image src={"/logo.png"} alt="logo" width={50} height={50} />
          </div>
        </div>
      </div>

      <header className="hidden lg:flex justify-around p-5 text-black text-lg h-32 items-center">
        <div className="">
          <Image src={"/logo.png"} alt="logo" width={65} height={65} />
        </div>
        <div className="flex gap-10">
          <Link href={"#"}>Home</Link>
          <Link href={"#"}>Product</Link>
          <Link href={"#"}>Contact</Link>
          <Link href={"#"}>FAQ</Link>
        </div>
        <div>
          <Link href={"/login"} className="flex flex-row gap-3 items-center">
            <LogIn />
            <h1>Login</h1>
          </Link>
        </div>
      </header>
    </div>
  );
}
