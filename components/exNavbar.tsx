"use client";

import Link from "next/link";
import Image from "next/image";
import { useLogin } from "@/hooks/user-store";
import { LogIn, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const isLogin = useLogin((state) => state.loginStatus);
  return (
    <div>
      <div>
        <div className="lg:hidden flex py-6 items-center justify-between">
          {/* Menu (on the left) */}
          <div className="flex items-center ps-3">
            <Sheet>
              <SheetTrigger>
                <Menu size={35} />
              </SheetTrigger>
              <SheetContent side={"left"}>
                <SheetHeader>
                  <SheetTitle>Are you absolutely sure?</SheetTitle>
                  <SheetDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo (centered) */}
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
