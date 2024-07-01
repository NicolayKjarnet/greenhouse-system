import { useState, useEffect, useCallback } from 'react';
import GreenhouseService from '../services/GreenhouseService';

type DataPoint = {
    x: number;
    y: number;
    color: string;
};

type CurrentReadings = {
    temperature: number;
    humidity: number;
    light: number;
};

type GreenhouseDataItem = {
    temperature: number;
    humidity: number;
    light: number;
};

const useGreenhouseData = (selectedGreenhouse: number, maxMeasurements: number = 20) => {
    const [tempSeries, setTempSeries] = useState<DataPoint[]>([]);
    const [humiditySeries, setHumiditySeries] = useState<DataPoint[]>([]);
    const [lightSeries, setLightSeries] = useState<DataPoint[]>([]);

    const [currentReadings, setCurrentReadings] = useState<CurrentReadings>({
        temperature: 0,
        humidity: 0,
        light: 0,
    });

    const fetchAndProcessData = useCallback(async () => {
        if (!selectedGreenhouse) return;
        try {
            const response = await GreenhouseService.getGreenhouseById(selectedGreenhouse);
            const data: GreenhouseDataItem[] = response.data;
            const tempData = data.map((item, index: number) => ({
                x: index,
                y: item.temperature,
                color:
                    item.temperature >= 33
                        ? '#FF4136'
                        : item.temperature <= 19
                        ? '#2ECC40'
                        : '#BDBDBD',
            }));

            const humidityData = data.map((item, index: number) => ({
                x: index,
                y: item.humidity,
                color:
                    item.humidity >= 85 ? '#FF4136' : item.humidity <= 60 ? '#2ECC40' : '#BDBDBD',
            }));

            const lightData = data.map((item, index: number) => ({
                x: index,
                y: item.light,
                color:
                    item.light >= 100_000
                        ? '#FF4136'
                        : item.light <= 32_000
                        ? '#2ECC40'
                        : '#BDBDBD',
            }));

            setTempSeries(tempData.slice(-maxMeasurements));
            setHumiditySeries(humidityData.slice(-maxMeasurements));
            setLightSeries(lightData.slice(-maxMeasurements));

            setCurrentReadings({
                temperature: tempData[tempData.length - 1]?.y || 0,
                humidity: humidityData[humidityData.length - 1]?.y || 0,
                light: lightData[lightData.length - 1]?.y || 0,
            });
        } catch (error) {
            console.error(error);
        }
    }, [selectedGreenhouse, maxMeasurements]);

    useEffect(() => {
        fetchAndProcessData();
        const intervalId = setInterval(fetchAndProcessData, 5000); // Adjust interval as needed
        return () => clearInterval(intervalId);
    }, [fetchAndProcessData]);

    return { tempSeries, humiditySeries, lightSeries, currentReadings };
};

export default useGreenhouseData;
