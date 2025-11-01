"use client";

import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { getDashboardData } from "../../action/action";

import { useEffect, useState } from "react";

interface Props {
    totalRevenue: number;
    finishedCount: number;
    notFinishedCount: number;
}

export default function Page() {
    const [cardData, setCardData] = useState<Props>({
        totalRevenue: 0,
        finishedCount: 0,
        notFinishedCount: 0,
    });

    const [data, setData] = useState([]);
    useEffect(() => {
        const getData = async () => {
            try {
                const data = await getDashboardData();
                const totalRevenue = data.totalRevenue.toLocaleString();
                const finishedCount = data.finishedCount;
                const notFinishedCount = data.notFinishedCount;
                setCardData({ totalRevenue, finishedCount, notFinishedCount });
                setData(data.getChart);
            } catch (err) {}
        };

        getData();
    }, []);

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <SectionCards props={cardData} />
                    {/* <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div> */}
                    {data.length > 0 ? (
                        <DataTable props={data} />
                    ) : (
                        <div className="text-center text-sm text-muted-foreground py-6">
                            Loading data...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
