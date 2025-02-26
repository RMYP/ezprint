"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LogoutButtonMobile,
  LogoutButtonDekstop,
} from "@/components/logoutButton";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  Pencil,
  Settings,
  Sliders,
} from "lucide-react";

export default function ProfileEditPage() {
  const router = useRouter();
  return (
    <div>
      <div
        id="smNavbar"
        className="bg-white p-6 flex items-center lg:hidden md:hidden"
      >
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-1" size={18} /> <p>Home</p>
        </Button>
      </div>
      <div className="max-w-7xl mx-auto p-4">
        {/* Navigation  mobile*/}
        <div className="flex items-center gap-4 mb-5 md:hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="px-4 py-2">
                <Sliders size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="space-y-1">
              <DropdownMenuItem>
                <Pencil className="mr-2" size={16} /> Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2" size={16} /> Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogoutButtonMobile
                  props={
                    " text-red-600 rounded bg-white border-none flex flex-row gap-2"
                  }
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Profile Form */}
        <div className="flex flex-col lg:flex-row gap-5 ">
          <div className=" basis-1/4 bg-white rounded-xl shadow-md p-4 justify-center lg:flex md:flex flex-col h-fit hidden">
            <Link
              href={"/profile"}
              className="flex flex-row gap-3 items-center font-medium cursor-pointer hover:bg-muted py-3 px-2 rounded-lg"
            >
              <Pencil />
              <p className="text-md">Edit Profile</p>
            </Link>
            <Link
              href={"/account"}
              className="flex flex-row gap-3 items-center font-medium cursor-pointer hover:bg-muted py-3 px-2 rounded-lg "
            >
              <Settings />
              <p className="text-md">Account Setting</p>
            </Link>
            <LogoutButtonDekstop
              props={
                "flex flex-row gap-3 items-center font-medium cursor-pointer hover:bg-muted py-3 px-2 rounded-lg text-md"
              }
            />
          </div>
          <div className="w-full">
            <Card className="p-1">
              <CardHeader>
                <CardTitle>Edit Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-white p-2 rounded-md text-center font-semibold ">
                  Ubah Password
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Password Lama
                    </label>
                    <Input
                      type="password"
                      placeholder="Masukkan password lama"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Password Baru
                    </label>
                    <Input
                      type="password"
                      placeholder="Masukkan password baru"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Konfirmasi Password Baru
                    </label>
                    <Input type="password" placeholder="Ulangi password baru" />
                  </div>
                </div>
                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
