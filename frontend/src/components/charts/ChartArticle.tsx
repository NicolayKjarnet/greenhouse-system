import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

type ChartArticleProps = {
    title: string;
    currentReadings: {
        temperature: number;
        humidity: number;
        light: number;
    };
    options: ApexOptions;
    seriesData: {
        temperature: { x: number; y: number; color: string }[];
        humidity: { x: number; y: number; color: string }[];
        light: { x: number; y: number; color: string }[];
    };
    Chart: typeof Chart;
};

type SeriesDataKey = 'temperature' | 'humidity' | 'light';

export const ChartArticle: React.FC<ChartArticleProps> = ({
    title,
    currentReadings,
    options,
    seriesData,
    Chart,
}) => {
    const key = title.toLowerCase() as SeriesDataKey;

    const getReading = () => {
        switch (key) {
            case 'temperature':
                return `${currentReadings.temperature}°C`;
            case 'humidity':
                return `${currentReadings.humidity}%`;
            case 'light':
                return `${currentReadings.light} lux`;
            default:
                return 'N/A';
        }
    };

    return (
        <article className="chart-article">
            <h2 className="chart-title chart-title__humidity">{title}</h2>
            <h3 className="current-reading">{getReading()}</h3>
            <Chart
                className="chart"
                options={options}
                series={[{ name: title, data: seriesData[key] }]}
                type="area"
            />
        </article>
    );
};
