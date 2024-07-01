import { useEffect } from 'react';
import ChartItem from './ChartItem';
import { useGreenhouseContext } from '../../hooks/useGreenhouseContext';

const ChartList = () => {
    const { greenhouseArray } = useGreenhouseContext();

    useEffect(() => {
        displayAllCharts();
    });

    const displayAllCharts = () => {
        return greenhouseArray.length > 0 ? (
            greenhouseArray.map((chart, i) => (
                <ChartItem
                    key={`chart-${chart._id}`}
                    id={chart.greenhouseId}
                    chartName={`Greenhouse ${chart.greenhouseId}`}
                    genre="Temperature"
                    data={chart.temperature}
                />
            ))
        ) : (
            <p>No charts found.</p>
        );
    };

    return (
        <section>
            <h2>Charts</h2>
            <div className="chart-container row">{displayAllCharts()}</div>
        </section>
    );
};

export default ChartList;
