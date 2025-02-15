import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-zinc-800 w-full p-10 mt-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between gap-10">
        {/* Brand Section */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold">EzPrint.id</h2>
          <p className="text-gray-800 mt-2">
            Layanan terbaik untuk kebutuhan pencetakan dokumen Anda.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Navigasi</h3>
          <ul className="mt-2 space-y-2 text-gray-800">
            <li>
              <a href="#" className="hover:text-gray-700 transition">
                Beranda
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-700 transition">
                Layanan
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-700 transition">
                Tentang Kami
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-700 transition">
                Kontak
              </a>
            </li>
          </ul>
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold">Kontak</h3>
          <p className="text-gray-800 mt-2">Jl. Perjuangan, gg. Alam Segar 2 No.2, Sempaja Sel., Kec. Samarinda Utara, Kota Samarinda, Kalimantan Timur</p>
          <p className="text-gray-800">Email: rizkimauludinyoga@gmail.com</p>
          <p className="text-gray-800">Telepon: +62 812 3456 7890</p>

          <div className="flex gap-4 mt-5">
            <a href="#" className="text-gray-800 hover:text-white transition">
              <Facebook />
            </a>
            <a href="#" className="text-gray-800 hover:text-white transition">
              <Instagram />
            </a>
            <a href="#" className="text-gray-800 hover:text-white transition">
              <Twitter />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-700 pt-5">
        &copy; {new Date().getFullYear()} Your Brand. All rights reserved.
      </div>
    </footer>
  );
}
