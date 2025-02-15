"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/exNavbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  LogOut,
  Pencil,
  Settings,
  Sliders,
  LogOutIcon,
} from "lucide-react";

export default function ProfileEditPage() {
  const user = {
    username: "Riski Mauludin Yoga",
    familyName: "Potter",
    phone: "875 7436 1473",
    email: "nekonimerz@gmail.com",
    profilePic: "/default-avatar.png",
  };

  return (
    <div>
      <Navbar props="bg-white mb-5" />
      <div className="max-w-7xl mx-auto p-4">
        {/* Navigation  mobile*/}
        {/* <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="bg-purple-300 hover:bg-purple-400 text-black"
          >
            <ChevronLeft className="mr-2" size={18} /> Home Page
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="px-4 py-2">
                <Sliders size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <Pencil className="mr-2" size={16} /> Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2" size={16} /> Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2" size={16} /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}

        {/* Profile Form */}
        <div className="flex flex-row gap-5">
          <div className="basis-1/4 bg-white rounded-xl shadow-md p-4 justify-center flex flex-col h-fit">
            <Link
              href={"/"}
              className="flex flex-row gap-3 items-center font-medium cursor-pointer hover:bg-muted py-3 px-2 rounded-lg" 
            >
              <Pencil />
              <p className="text-md">Edit Profile</p>
            </Link>
            <Link
              href={"/"}
              className="flex flex-row gap-3 items-center font-medium cursor-pointer hover:bg-muted py-3 px-2 rounded-lg "
            >
              <Settings />
              <p className="text-md">Account Setting</p>
            </Link>
            <Link
              href={"/"}
              className="flex flex-row gap-3 items-center font-medium cursor-pointer hover:bg-muted py-3 px-2 rounded-lg "
            >
              <LogOutIcon />
              <p className="text-md">LogOut</p>
            </Link>
          </div>
          <div className="w-full">
            <Card className="p-1">
              <CardHeader>
                <CardTitle>Edit Profile Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-white p-2 rounded-md text-center font-semibold ">
                  Personal Data
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Full Name
                    </label>
                    <Input type="text" value={user.username} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Family Name
                    </label>
                    <Input type="text" value={user.familyName} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Phone Number
                    </label>
                    <Input type="text" value={user.phone} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <Input type="email" value={user.email} />
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
