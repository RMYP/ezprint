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
  Briefcase,
  MessageCircle,
  Bell,
  Settings,
  Loader2,
  LogIn,
  LogOut,
  ShoppingCart,
  UserRound,
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

export default function Navbar({ props }: { props: undefined | string }) {
  const menuItems = [
    { label: "Home", icon: Home, path: "/home" },
    { label: "My Profile", icon: User, path: "/profile" },
    { label: "Notification", icon: Bell, path: "/notification" },
    { label: "Setting", icon: Settings, path: "setting" },
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
                      className="bg-transparent text-white w-full"
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
                      }}
                      className="bg-transparent text-white w-full"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <LogIn size={20} />
                      )}
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
          {lgMenuItems.map((item) => (
            <Link key={item.label} href={item.path}>{item.label}</Link>
          ))}
        </div>
        <div>
          {isLogin ? (
            <div className="pe-5 flex gap-5">
              <Link href={"/notification"}>
                <Bell />
              </Link>
              <Link href={"/chart"}>
                <ShoppingCart />
              </Link>
              <Link href={"/profile"}>
                <UserRound />
              </Link>
            </div>
          ) : (
            <div className="pe-5">
              <Link href={"/login"} className="flex gap-2">
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
