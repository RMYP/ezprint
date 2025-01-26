import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <div>
      <header className="flex justify-around p-5 text-black text-lg h-32 items-center">
        <div>
            <Image
            src={"/logo.png"}
            alt="logo"
            width={65}
            height={65}
            />
        </div>
        <div className="flex gap-10">
            <Link href={"#"}>Home</Link>
            <Link href={"#"}>Product</Link>
            <Link href={"#"}>Contact</Link>
            <Link href={"#"}>FAQ</Link>
        </div>
        <div>Login</div>
      </header>
    </div>
  );
}
