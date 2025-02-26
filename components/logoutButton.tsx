"use client";

import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/user-store";
import { LogOutIcon } from "lucide-react";

export function LogoutButtonMobile({props} : {props: string}) {
  const refreshToken = useLogin((state) => state.refreshToken);
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout");
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    refreshToken()
    router.push("/home");
  };

  return (
    <div
      onClick={handleLogout}
      className={props}
    >
      <LogOutIcon className="mr-2" size={16}/>
      Logout
    </div>
  );
}

export function LogoutButtonDekstop({props} : {props: string}) {
  const refreshToken = useLogin((state) => state.refreshToken);
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout");
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    refreshToken()
    router.push("/home");
  };

  return (
    <div
      onClick={handleLogout}
      className={props}
    >
      <LogOutIcon className="mr-2" />
      Logout
    </div>
  );
}