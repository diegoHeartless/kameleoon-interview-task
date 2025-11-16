import type { WeekOption } from "../../model/chart-model";

export const getWeekOptions = (xAxisData: string[]) => {
    const weeks: WeekOption[] = [];
    const xAxisDataTemp = [...xAxisData];
    let firstDay: string | undefined;
    let lastDay: string | undefined;
    xAxisDataTemp.reverse().forEach((item: string, index: number) => {
        if (!lastDay) {
            lastDay = item;
        }
        if (index % 7 === 0 && index !== 0) {
            firstDay = item;
        }
        if (lastDay && firstDay) {
            weeks.push({
                label: firstDay,
                value: index / 7,
                startValue: firstDay,
                endValue: lastDay,
            });
            lastDay = undefined;
            firstDay = undefined;
        }
    });
    return weeks;
};