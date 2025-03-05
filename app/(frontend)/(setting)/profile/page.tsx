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
import { ChevronLeft, Pencil, Settings, Sliders } from "lucide-react";

import { useEffect, useState } from "react";
import { useLogin } from "@/hooks/user-store";
import { updateUserData, getUserInfo } from "../../action/action";

export default function ProfileEditPage() {
  const router = useRouter();
  const userId = useLogin((state) => state.userId);
  const [user, setUser] = useState({
    username: "",
    phoneNum: "",
    email: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userId) {
          const getUser = await getUserInfo(userId);
          setUser({
            username: getUser.username || "",
            phoneNum: getUser.phoneNumber || "",
            email: getUser.email || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleUpdateUser = async () => {
    if (!userId) return;

    try {
      await updateUserData(user.username, user.phoneNum, userId);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

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
                <LogoutButtonMobile props=" text-red-600 rounded bg-white border-none flex flex-row gap-2" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Profile Form */}
        <div className="flex flex-col lg:flex-row gap-5 ">
          <div className="basis-1/4 bg-white rounded-xl shadow-md p-4 justify-center lg:flex md:flex flex-col h-fit hidden">
            <Link
              href="/profile"
              className="flex flex-row gap-3 items-center font-medium cursor-pointer hover:bg-muted py-3 px-2 rounded-lg"
            >
              <Pencil />
              <p className="text-md">Edit Profile</p>
            </Link>
            <Link
              href="/account"
              className="flex flex-row gap-3 items-center font-medium cursor-pointer hover:bg-muted py-3 px-2 rounded-lg"
            >
              <Settings />
              <p className="text-md">Account Setting</p>
            </Link>
            <LogoutButtonDekstop props="flex flex-row gap-3 items-center font-medium cursor-pointer hover:bg-muted py-3 px-2 rounded-lg text-md" />
          </div>

          <div className="w-full">
            <Card className="p-1">
              <CardHeader>
                <CardTitle>Edit Profile Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-white p-2 rounded-md text-center font-semibold">
                  Personal Data
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Nama Pengguna
                    </label>
                    <Input
                      type="text"
                      value={user.username}
                      onChange={(e) =>
                        setUser({ ...user, username: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Nomor WA
                    </label>
                    <Input
                      type="number"
                      value={user.phoneNum}
                      onChange={(e) =>
                        setUser({ ...user, phoneNum: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={user.email}
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                  onClick={handleUpdateUser}
                >
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
