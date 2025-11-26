import Holidays from "date-holidays";

const hd = new Holidays("ID");

const PeakPeriods = [
    { start: "05-01", end: "06-30" },
    { start: "11-01", end: "12-30" },
    { start: "01--01", end: "02-01" },
];

export function checkIsPeakAcademik(date: Date): number {
    const dateString = date.toISOString().split("T")[0];
    for (const period of PeakPeriods) {
        if (dateString >= period.start && dateString <= period.end) return 1;
    }
    return 0;
}

export function checkIsHoliday(date: Date): number {
    const isHoliday = hd.isHoliday(date);
    return isHoliday ? 1 : 0;
}