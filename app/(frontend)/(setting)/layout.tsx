import Navbar from "@/components/exNavbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar props="bg-white mb-5 hidden lg:block md:block" />
      {children}
    </div>
  );
}
