"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ProgressUploaderProps {
  onUploadSuccess: (id: string, fileName: string) => void;
  onRemove: () => void;
}

export default function ProgressUploader({ onUploadSuccess, onRemove }: ProgressUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];

      // Validasi PDF & Ukuran
      if (selected.type !== "application/pdf") {
        toast.error("Hanya file PDF yang diperbolehkan");
        return;
      }
      if (selected.size > 50 * 1024 * 1024) { // 50MB
        toast.error("File terlalu besar (Maks 50MB)");
        return;
      }

      setFile(selected);
      setStatus("idle");
      setProgress(0);
    }
  };

  // Fungsi Upload Manual dengan Progress Bar (XHR)
  const uploadFile = () => {
    if (!file) return;

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    // 1. Event Listener Progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    // 2. Event Listener Selesai
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          setStatus("success");
          toast.success("File berhasil diupload!");
          
          // Asumsi API kamu mengembalikan object order di dalam `data`
          // Sesuaikan 'response.data.id' dengan struktur return API kamu
          onUploadSuccess(response.data.id, file.name);
        } catch (e) {
          setStatus("error");
          toast.error("Gagal membaca respon server");
        }
      } else {
        setStatus("error");
        toast.error("Upload gagal.");
      }
    };

    xhr.onerror = () => {
      setStatus("error");
      toast.error("Terjadi kesalahan jaringan.");
    };

    // Kirim ke API Route kamu yang lama
    xhr.open("POST", "/api/upload"); 
    xhr.send(formData);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onRemove(); 
  };

  return (
    <div className="w-full space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf"
      />

      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition border-slate-300 flex flex-col items-center gap-2"
        >
          <div className="p-3 bg-blue-50 rounded-full">
            <UploadCloud className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="font-medium text-sm text-slate-700">Klik untuk pilih PDF</p>
            <p className="text-xs text-slate-400">Maksimal 50MB</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-white shadow-sm border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText className="h-8 w-8 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate max-w-[180px]">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            {status !== 'uploading' && (
              <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-8 w-8 text-slate-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </Button>
            )}
            
            {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
          </div>

          {(status === 'uploading' || status === 'success') && (
            <div className="w-full bg-slate-100 rounded-full h-2 mb-1 overflow-hidden">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex justify-between text-xs mt-1">
             <span className={`${status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                {status === 'uploading' && `Mengupload... ${progress}%`}
                {status === 'success' && 'Upload Selesai. Silakan isi form di bawah.'}
                {status === 'error' && 'Gagal. Coba lagi.'}
                {status === 'idle' && 'File siap diupload'}
             </span>
             {status === 'idle' && (
               <Button size="sm" onClick={uploadFile} className="h-7 text-xs">
                 Upload Sekarang
               </Button>
             )}
          </div>
        </div>
      )}
    </div>
  );
}