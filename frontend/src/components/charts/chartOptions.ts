import { ApexOptions } from 'apexcharts';

type ChartOptions = {
    color: string;
    seriesColor: string[];
    min: number;
    max: number;
};

export const makeChartOptions = ({ color, seriesColor, min, max }: ChartOptions): ApexOptions => ({
    chart: {
        height: 300,
        type: 'line',
    },
    dataLabels: {
        enabled: true,
        style: {
            colors: seriesColor,
        },
    },
    stroke: {
        curve: 'smooth',
    },
    noData: {
        text: 'Loading...',
    },
    colors: [color],
    yaxis: {
        min,
        max,
    },
});
