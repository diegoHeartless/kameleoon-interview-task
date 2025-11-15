import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import useGetData from "../../api/get-data";
import type {
    ChartData,
    ChartResponse,
    Variation,
    SelectorOption,
    SeriesData,
    FormatterParams,
} from "../../model/chart-model";
import type { ECharts } from "echarts";
import Select, { type SingleValue } from "react-select";
import styles from "./chart-view.module.css";

const ChartView = () => {
    const dataResponse: ChartResponse | undefined = useGetData();
    const chartRef = useRef<ECharts>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [selectedSeries, setSelectedSeries] = useState<SingleValue<SelectorOption>>();
    const [selectedChartStyle, setSelectedChartStyle] = useState<SingleValue<SelectorOption>>();
    const [theme, setTheme] = useState<"dark" | "light">("light");

    const chartsStyles: SelectorOption[] = useMemo(
        () => [
            { label: "Line", value: "line" },
            { label: "Smooth line", value: "smooth" },
            { label: "Area", value: "area" },
        ],
        []
    );

    const seriesControl: SelectorOption[] = useMemo(() => {
        if (!dataResponse?.variations) {
            return [];
        }
        const defaultSeries: SelectorOption[] = [{ label: "All variations", value: undefined }];
        const optionsFromData: SelectorOption[] | undefined =
            dataResponse?.variations.map((variation: Variation) => ({
                label: variation.name,
                value: variation.id || 0,
            })) || [];
        return defaultSeries.concat(optionsFromData);
    }, [dataResponse?.variations]);

    useEffect(() => {
        if (seriesControl?.length > 0) {
            setSelectedSeries(seriesControl?.[0]);
            setSelectedChartStyle(chartsStyles?.[0]);
        }
    }, [seriesControl, setSelectedSeries, chartsStyles, setSelectedChartStyle]);

    const formatter = useCallback((params: FormatterParams) => {
        const colorSpan = (color: string): string =>
            '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' +
            color +
            '"></span>';
        let rez: string = "<p>" + params[0].axisValue + "</p>";
        console.log(params);
        params
            .filter((item) => item.data)
            .sort((a, b) => b.data - a.data)
            .forEach((item) => {
                if (item.data) {
                    const xx: string =
                        "<p>" +
                        colorSpan(item.color) +
                        " " +
                        item.seriesName +
                        ": " +
                        item.data +
                        "%" +
                        "</p>";
                    rez += xx;
                }
            });
        console.log(rez);
        return rez;
    }, []);

    const variationsToDataMap: Record<string, SeriesData> = useMemo(() => {
        const variationsToDataMap: Record<string, SeriesData> = {};

        dataResponse?.variations.forEach((variation: Variation) => {
            let maxY: number = 0;
            const xAxisData: string[] = [];
            const seriesData = dataResponse?.data.map((item: ChartData) => {
                const id = variation?.id || "0";
                const conversions: number = item.conversions[id];
                const visits: number = item.visits[id];
                const conversionRate: number = Number(((conversions / visits) * 100).toFixed(2));
                if (conversionRate) {
                    xAxisData.push(item.date);
                }
                if (conversionRate > maxY) {
                    maxY = conversionRate;
                }
                return conversionRate;
            });

            const variationName = variation.name || "Original";

            Object.assign(variationsToDataMap, {
                [variationName]: {
                    name: variationName,
                    xAxisData: xAxisData,
                    maxY: maxY,
                    data: seriesData,
                },
            });
        });

        return variationsToDataMap;
    }, [dataResponse?.data, dataResponse?.variations]);

    const currentSeries: SeriesData | SeriesData[] = useMemo(() => {
        return selectedSeries?.value !== undefined
            ? variationsToDataMap[selectedSeries.label]
            : Object.values(variationsToDataMap);
    }, [selectedSeries, variationsToDataMap]);

    const lineOptions = useMemo(() => {
        return {
            ...(selectedChartStyle?.value === "area" ? { areaStyle: { opacity: 0.5 } } : {}),
            ...(selectedChartStyle?.value === "smooth" ? { smooth: true } : {}),
        };
    }, [selectedChartStyle]);

    useEffect(() => {
        if (!currentSeries || !chartRef.current) {
            return;
        }
        let options = {
            title: {
                text: "Line Chart",
            },
            tooltip: {
                trigger: "axis",
                formatter,
            },
            dataZoom: [
                {
                    type: "inside",
                },
            ],
            emphasis: {
                focus: "series",
            },
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: {
                        show: true,
                        type: 'png'
                    }
                }
            },
            xAxis: { axisLabel: { interval: "auto", rotate: 45 }, data: {} },
            yAxis: { axisLabel: { formatter: "{value} %" }, max: 0 },
            series: {},
            legend: {
                data: {},
            },
            grid: {},
        };
        if (Array.isArray(currentSeries)) {
            const series = currentSeries.map((series) => ({
                ...lineOptions,
                name: series.name,
                type: "line",
                data: series.data,
            }));
            const xAxisData = currentSeries.sort(
                (a, b) => b.xAxisData.length - a.xAxisData.length
            )[0]?.xAxisData;
            const maxY = currentSeries.sort((a, b) => b.maxY - a.maxY)[0]?.maxY;
            options = {
                ...options,
                xAxis: {
                    ...options.xAxis,
                    data: xAxisData,
                },
                yAxis: { ...options.yAxis, max: maxY },
                series: series,
                legend: {
                    data: currentSeries.map((series) => series.name),
                },
                grid: {
                    bottom: "100",
                },
            };
        } else {
            const data = [...currentSeries.data];
            while (isNaN(data[data.length - 1])) {
                data.pop();
            }
            while (isNaN(data[0])) {
                data.shift();
            }
            const series = [
                {
                    ...lineOptions,
                    name: currentSeries.name,
                    type: "line",
                    data: data,
                },
            ];
            options = {
                ...options,
                xAxis: { ...options.xAxis, data: currentSeries.xAxisData },
                yAxis: { ...options.yAxis, max: currentSeries.maxY },
                series: series,
            };
        }

        chartRef.current.clear();
        chartRef.current.setOption(options, { notMerge: true });
    }, [currentSeries, formatter, lineOptions]);

    useEffect(() => {
        if (!chartContainerRef.current) {
            return;
        }
        echarts.registerTheme("light", { backgroundColor: "white" });
        const chart = echarts.init(chartContainerRef.current);

        chartRef.current = chart;
        return () => {
            chart.dispose();
            chartRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.setTheme(theme);
        }
    }, [theme]);

    const resizeChart = useCallback(() => {
        if (chartRef.current) {
            chartRef.current?.resize();
        }
    }, []);

    useEffect(() => {
        window.addEventListener("resize", resizeChart);
        return () => {
            window.removeEventListener("resize", resizeChart);
            chartRef.current?.dispose();
        };
    }, [resizeChart]);

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.select}>
                    <Select
                        options={seriesControl}
                        onChange={(value: SingleValue<SelectorOption>) => setSelectedSeries(value)}
                        value={selectedSeries}
                    />
                </div>
                <div className={styles.select}>
                    <Select
                        options={chartsStyles}
                        onChange={(value: SingleValue<SelectorOption>) =>
                            setSelectedChartStyle(value)
                        }
                        value={selectedChartStyle}
                    />
                </div>
                <button
                    className={styles.button}
                    onClick={() => {
                        chartRef.current?.setOption({
                            dataZoom: [
                                {
                                    start: 0,
                                    end: 100,
                                },
                            ],
                        });
                    }}
                >
                    Reset Zoom
                </button>
                <label>Dark mode</label>
                <input
                    type="checkbox"
                    onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                />
            </div>
            <div ref={chartContainerRef} className={styles.chartContainer} />
        </div>
    );
};

export default ChartView;
