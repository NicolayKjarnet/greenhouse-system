import React from 'react';
import Chart from 'react-apexcharts';
import { ChartItemProps } from '../../types/ChartItemProps';

const ChartItem: React.FC<ChartItemProps> = ({ id, chartName, data }) => {
    const chartOptions = {
        chart: {
            id: `basic-bar-${id}`,
        },
        xaxis: {
            categories: data.map((_, index) => 1991 + index),
        },
    };

    const chartSeries = [
        {
            name: chartName,
            data: data,
        },
    ];

    return (
        <div className="app">
            <h3>{chartName}</h3>
            <div className="row">
                <div className="mixed-chart">
                    <Chart options={chartOptions} series={chartSeries} type="bar" width="500" />
                </div>
            </div>
        </div>
    );
};

export default ChartItem;
