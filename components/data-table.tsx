"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from "@/components/ui/table";
import { Bug, FileDown } from "lucide-react";
import { Button } from "./ui/button";
import Link from 'next/link'

export interface Payment {
    id?: string;
    grossAmount: string;
}

export interface User {
    id: string;
    username: string;
    phoneNum: string | null;
}

export interface Order {
    id: string;
    documentName: string;
    paperType: string;
    status:
        | "waitingCheckout"
        | "waitingPayment"
        | "confirmOrder"
        | "onProgress"
        | "deny"
        | "finished";
    sheetCount: number;
    quantity: number;
    Payment: Payment[];
    user: User;
}

export function DataTable({ props }: { props: Order[] }) {
    return (
        <div className="border mx-2 rounded-t-lg">
            <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow className="rounded-t-lg">
                        <TableHead className="w-[100px]">
                            <Bug />
                        </TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Jenis Kertas</TableHead>
                        <TableHead>Rangkap</TableHead>
                        <TableHead>Jumlah Halaman</TableHead>
                        <TableHead>Pemesan</TableHead>
                        <TableHead className="text-right">File</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.map((data, index) => (
                        <TableRow key={data.id || index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                                <Link href={`/working-room/${data.id}`}>{data.documentName}</Link>
                            </TableCell>
                            <TableCell>{data.status}</TableCell>
                            <TableCell>{data.paperType}</TableCell>
                            <TableCell>{data.quantity}</TableCell>
                            <TableCell>{data.sheetCount}</TableCell>
                            <TableCell> 
                                {data.user?.username || "Unknown"}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button>
                                    <FileDown />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
