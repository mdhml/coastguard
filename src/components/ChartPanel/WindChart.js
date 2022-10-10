import React, { useEffect, useState } from "react";
/*import { Chart, caculateWindRose } from "react-windrose-chart";*/
import axios from "axios";
import * as dayjs from 'dayjs'
import { GetTimeOffset, Log } from "./../App/Helpers"
import WindRose from "./../WindRose"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Label
} from "recharts";

const settings = {
    refreshMillis: 1000 * 60 * 1,   // get new data every 1 hour
    fromHours: -6,                  // use a window of tide information from 6 hours behind now()
    toHours: 0,                     // use a window of tide information to 6 hours ahead of now()
    tickSeconds: 1 * 60 * 60,       // interval for chart ticks
    url: "https://coastguard.netlify.app/.netlify/functions/weather",
    fontSize: 16,
    fontColor: "white",
    numberPrecision: 0,
    windRoseWidth: 350,
    windRoswHeight: 350
}

/**
 * Displays wind
 *
 * @returns {JSX.Element} Wind component:
 * 
 * */
function WindChart() {

    // ----------------------------------------------------------------------------------------------------
    // props, state, refs

    let [data, setData] = useState([]);                 // data received from the server
    let [speedNow, setSpeedNow] = useState(0);          // current speed in knots
    let [directionNow, setDirectionNow] = useState(0);  // current direction in degrees

    // ----------------------------------------------------------------------------------------------------
    // refresh data from the server

    useEffect(() => {
        refresh();
        const refreshTimer = setInterval(() => {
            refresh();
        }, settings.refreshMillis);
        return () => {
            clearInterval(refreshTimer);
        };
    }, []);

    function refresh() {

        const timeFrom = GetTimeOffset(settings.fromHours);
        const dtFrom = Math.floor(timeFrom.getTime() / 1000);
        const timeTo = GetTimeOffset(settings.toHours);
        const dtTo = Math.floor(timeTo.getTime() / 1000);

        let url = `${settings.url}?field=wind&limit=1000&from=${dtFrom}&to=${dtTo}`;
        Log("wind", url);

        axios.get(url)
            .then((response) => {
                const data = response.data;
                setData(data);

                const lastRecord = data[data.length - 1].value;
                setSpeedNow(lastRecord.knots);
                setDirectionNow(lastRecord.direction);
                Log("wind", data);

            })
            .catch((err) => {
                Log("wind error", err);
            });
    };

    // ----------------------------------------------------------------------------------------------------

    const formatXAxis = item => {
        return dayjs.unix(item).format('HH:mm');
    }

    const formatYAxis = item => {
        return item.toFixed(1);
    }

    const formatTicks = () => {

        // get the start tick for the next even increment
        const dtFrom = GetTimeOffset(settings.fromHours).getTime() / 1000 + settings.tickSeconds;
        const dtTo = GetTimeOffset(settings.toHours).getTime() / 1000;

        let dtTick = Math.floor(dtFrom / settings.tickSeconds) * settings.tickSeconds;
        let tickArray = [];
        while (dtTick < dtTo) {
            tickArray.push(dtTick);
            dtTick += settings.tickSeconds;
        }
        return tickArray;
    }

    // ----------------------------------------------------------------------------------------------------

    return (
        <div className="wrapper">
            {/*            <div className="label left">Wind</div>*/}
            <WindRose
                data={data}
                precision={settings.numberPrecision}
                width={settings.windRoseWidth}
                height={settings.windRoseHeight} />
            <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={data}
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="windColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="50%" stopColor="#9933FF" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#660066" stopOpacity={0.7} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="dt"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        scale="time"
                        interval="preserveStart"
                        tickFormatter={formatXAxis}
                        angle={0}
                        tick={{ fontSize: settings.fontSize, fill: settings.fontColor }}
                        ticks={formatTicks()}
                        allowDataOverflow={true}
                    />
                    <YAxis
                        type="number"
                        tick={{ fontSize: settings.fontSize, fill: settings.fontColor }}
                        domain={['dataMin-1', 'dataMax+1']}
                        tickFormatter={formatYAxis}
                        interval={'preserveStart'}
                        allowDataOverflow={true}
                    >
                        <Label
                            value='knots'
                            position='insideLeft'
                            angle={-90}
                            style={{
                                textAnchor: 'middle',
                                fontSize: settings.fontSize,
                                fill: 'white'
                            }}
                        />
                    </YAxis>
                    <CartesianGrid stroke="#555555" strokeWidth={1} />
                    <Area
                        type="monotone"
                        dataKey="value.knots"
                        stroke="#FF00FF"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#windColor)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default WindChart;