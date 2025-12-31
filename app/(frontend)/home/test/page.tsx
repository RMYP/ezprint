"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TestSSEPage() {
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Menghubungkan ke route SSE yang telah dibuat
    const eventSource = new EventSource("/api/v1/sse");

    eventSource.onopen = () => {
      console.log("SSE Connection Opened");
      setStatus("connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("New SSE Message:", data);
        // Menambahkan pesan baru ke daftar teratas
        setMessages((prev) => [data, ...prev]);
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      setStatus("error");
      eventSource.close();
    };

    // Membersihkan koneksi saat komponen unmount
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Test Koneksi SSE</CardTitle>
          <Badge variant={status === "connected" ? "default" : "destructive"}>
            {status.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Menghubungkan ke: <code className="bg-muted p-1 rounded">/api/v1/sse</code>
          </p>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">
              Log Pesanan Masuk (Real-time)
            </h3>
            
            {messages.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">
                Belum ada data diterima. Pastikan ada pesanan aktif atau coba buat pesanan baru.
              </p>
            ) : (
              <div className="space-y-2 border rounded-md p-4 bg-slate-50 max-h-96 overflow-y-auto">
                {messages.map((msg, index) => (
                  <pre key={index} className="text-xs bg-white p-2 rounded border shadow-sm">
                    {JSON.stringify(msg, null, 2)}
                  </pre>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}