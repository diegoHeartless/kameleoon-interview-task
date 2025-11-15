/**
 * Describes a single experiment variation returned from the backend.
 */
export type Variation = {
    /**
     * Unique identifier for the variation. Absent for the `Original` entry that represents the control.
     */
    id?: number;
    /**
     * Human-readable variation name.
     */
    name: string;
};

/**
 * Holds visit and conversion metrics for a specific date.
 */
export type ChartData = {
    /**
     * ISO-like date string (YYYY-MM-DD) representing the data point.
     */
    date: string;
    /**
     * Indexed collection of visit counts mapped by variation identifier.
     */
    visits: Record<string, number>;
    /**
     * Indexed collection of conversion counts mapped by variation identifier.
     */
    conversions: Record<string, number>;
};

/**
 * Complete payload returned by `GET /data`.
 */
export type ChartResponse = {
    /**
     * Collection of registered experiment variations.
     */
    variations: Variation[];
    /**
     * Time series metrics for each variation.
     */
    data: ChartData[];
};

export type FormatterParams = Array<{
    axisValue: string | number;
    color: string;
    seriesName: string;
    data: number;
}>;

export type SelectorOption = {
    label: string;
    value?: number | string | null;
};

export type SeriesData = {
    name: string;
    xAxisData: string[];
    maxY: number;
    data: number[];
};
