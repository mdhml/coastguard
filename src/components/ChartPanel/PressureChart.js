import React, { useEffect, useState } from "react";
import axios from "axios";
import * as dayjs from 'dayjs'
import { GetTimeOffset, Log } from "./../App/Helpers"
import styles from "./../App/styles.css"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Label,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

const settings = {
    refreshMillis: 1000 * 60 * 2,   // get new data every 2 minutes
    fromHours: -6,                  // use a window of tide information from 6 hours behind now()
    toHours: 0,                     // use a window of tide information to 6 hours ahead of now()
    tickSeconds: 1 * 60 * 60,       // interval for chart ticks
    url: "https://coastguard.netlify.app/.netlify/functions/weather",
    fontSize: 16,
    fontColor: "white",
    numberPrecision: 2
};

const initialData = [{ "value": 1013.2, "dt": 0 }, { "value": 1013.2, "dt": 1000 }];

/**
 * Displays pressure
 *
 * url: https://coastguard.netlify.app/.netlify/functions/weather?field=pressure&limit=1000&from=1665184647&to=1665206247
 * data: [{"value":1021,"dt":1665185100},{"value":1022,"dt":1665185580},... ]
 *
 * */
function PressureChart() {

    // ----------------------------------------------------------------------------------------------------
    // props, state, refs

    let [data, setData] = useState(initialData);    // data received from the server

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

        let url = `${settings.url}?field=pressure&limit=1000&from=${dtFrom}&to=${dtTo}`;
        Log("pressure", url);

        axios.get(url)
            .then((response) => {
                setData(response.data);
            })
            .catch((err) => {
                Log("pressure error", err);
            });
    };

    // ----------------------------------------------------------------------------------------------------

    const formatXAxis = item => {
        return dayjs.unix(item).format('HH:mm');
    }

    const formatYAxis = item => {
        return Math.round(item);
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
        //console.log(`pressure ticks: ${JSON.stringify(tickArray)}`);
        return tickArray;
    }

    // ----------------------------------------------------------------------------------------------------

    return (
        <div className="wrapper">
            <div className="label left">Pressure</div>
            <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="pressureColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="50%" stopColor="#00B050" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#008080" stopOpacity={0.7} />
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
                        domain={['dataMin-5', 'dataMax+5']}
                        tickFormatter={formatYAxis}
                        interval={0}
                        allowDecimals={false}
                        allowDataOverflow={true}
                    >
                        <Label
                            value='hPa'
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
                        dataKey="value"
                        stroke="#00CC00"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#pressureColor)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default PressureChart;