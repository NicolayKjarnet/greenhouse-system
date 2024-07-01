import Chart from 'react-apexcharts';
import { useGreenhouseContext } from '../../hooks/useGreenhouseContext';
import useGreenhouseData from '../../hooks/useGreenhouseData';
import { useState, useMemo } from 'react';
import { makeChartOptions } from './chartOptions';
import { ChartArticle } from './ChartArticle';

type SeriesData = {
    temperature: DataPoint[];
    humidity: DataPoint[];
    light: DataPoint[];
};

type DataPoint = {
    x: number;
    y: number;
    color: string;
};

const Charts = () => {
    const { greenhouseArray } = useGreenhouseContext();
    const [selectedGreenhouse, setSelectedGreenhouse] = useState<Number>(1);

    const { tempSeries, humiditySeries, lightSeries, currentReadings } = useGreenhouseData(
        Number(selectedGreenhouse),
    );

    const handleGreenhouseChange = (event: React.ChangeEvent<HTMLSelectElement>) =>
        setSelectedGreenhouse(Number(event.target.value));

    const temperatureOptions = useMemo(
        () =>
            makeChartOptions({
                color: '#ff4560',
                seriesColor: tempSeries.map(point => point.color),
                min: 0,
                max: 100,
            }),
        [tempSeries],
    );

    const humidityOptions = useMemo(
        () =>
            makeChartOptions({
                color: '#00BFFF',
                seriesColor: humiditySeries.map(point => point.color),
                min: 0,
                max: 100,
            }),
        [humiditySeries],
    );

    const lightOptions = useMemo(
        () =>
            makeChartOptions({
                color: '#FFD700',
                seriesColor: lightSeries.map(point => point.color),
                min: 0,
                max: 1000,
            }),
        [lightSeries],
    );

    const seriesData = {
        temperature: tempSeries,
        humidity: humiditySeries,
        light: lightSeries,
    };

    return (
        <>
            <div className="dropdown">
                <select onChange={handleGreenhouseChange} value={Number(selectedGreenhouse)}>
                    <option value="">Select greenhouse</option>
                    {greenhouseArray.map(greenhouse => (
                        <option key={greenhouse.greenhouseId} value={greenhouse.greenhouseId}>
                            Greenhouse {greenhouse.greenhouseId}
                        </option>
                    ))}
                </select>
            </div>

            <div className="chart-container">
                <ChartArticle
                    title="Temperature"
                    currentReadings={currentReadings}
                    options={temperatureOptions}
                    seriesData={seriesData}
                    Chart={Chart}
                />

                <ChartArticle
                    title="Humidity"
                    currentReadings={currentReadings}
                    options={humidityOptions}
                    seriesData={seriesData}
                    Chart={Chart}
                />

                <ChartArticle
                    title="Light"
                    currentReadings={currentReadings}
                    options={lightOptions}
                    seriesData={seriesData}
                    Chart={Chart}
                />
            </div>
        </>
    );
};

export default Charts;
