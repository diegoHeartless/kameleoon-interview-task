import type { WeekOption } from "../../model/chart-model";

/**
 * Генерирует опции недель для селектора масштабирования по неделям из массива дат.
 * Группирует даты в недельные интервалы.
 *
 * @param xAxisData - Массив строк дат для группировки в недели
 * @returns Массив опций недель с начальными и конечными значениями дат
 */
export const getWeekOptions = (xAxisData: string[]): WeekOption[] => {
    if (!xAxisData) {
        return [];
    }
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
