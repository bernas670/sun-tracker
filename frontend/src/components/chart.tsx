import { Area, AreaChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type LegendPayload, type TooltipContentProps } from "recharts";
import type { Day, SunData } from "../types";
import { dateToUnix, formatDate, formatSecToHMS, formatTime } from "../utils/datetime";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useState } from "react";

interface ChartProps {
  data: SunData,
}

type EventKey = keyof Omit<Day, "date" | "day_length">;
type Event = { [K in EventKey]: { label: string, color: string } };


const events: Event = {
  first_light: { label: "First Light", color: "#A0C4FF" },
  dawn: { label: "Dawn", color: "#BDB2FF" },
  sunrise: { label: "Sunrise", color: "#FFD6A5" },
  solar_noon: { label: "Solar Noon", color: "#FFFFB3" },
  golden_hour: { label: "Golden Hour", color: "#FFADAD" },
  sunset: { label: "Sunset", color: "#FFB4A2" },
  dusk: { label: "Dusk", color: "#B0A1FF" },
  last_light: { label: "Last Light", color: "#A0C4FF" },
}

export default function Chart({ data }: ChartProps) {
  const [hoveringDataKey, setHoveringDataKey] = useState<any>(null);
  const MAX_DAY_LENGTH = 24 * 60 * 60;

  const convertData = (data: SunData) => data.days.map(day => {
    const dateUnix = dateToUnix(day.date);

    const times = Object.keys(events).reduce((acc, key) => {
      const time = day[key as EventKey];
      if (!time) return acc;
      
      acc[key] = time - dateUnix;
      return acc;
    }, {} as any);
    // todo: create type

    const result = {
      date: formatDate(day.date),
      dateUnix: dateUnix,
      day_length: formatSecToHMS(day.day_length),
      ...times,
    };

    result["night_1"] = 0
    result["day_1"] = 0
    result["night_2"] = 0
    result["day_2"] = 0

    if (day.day_length === 0 ) {
      result["night_1"] = MAX_DAY_LENGTH
    } else if (day.day_length === MAX_DAY_LENGTH) {
      result["day_1"] = MAX_DAY_LENGTH
    } else {
      const sunrise = result["sunrise"] ?? 0
      const sunset = result["sunset"] ?? MAX_DAY_LENGTH

      result["night_1"] = sunrise < sunset ? sunrise : 0
      result["day_1"] = sunrise < sunset ? sunset - sunrise : sunset
      result["night_2"] = sunrise < sunset ? MAX_DAY_LENGTH - sunset : sunrise - sunset
      result["day_2"] = sunrise < sunset ? 0 : MAX_DAY_LENGTH - sunrise
    }

    return result;
  })

  const opacity = {
    day: 1,
    night: 1,
    first_light: 1,
    dawn: 1,
    solar_noon: 1,
    golden_hour: 1,
    dusk: 1,
    last_light: 1,
  }

  const handleMouseLeave = () => setHoveringDataKey(null)
  const handleMouseEnter = (payload: LegendPayload) => setHoveringDataKey(
    payload.dataKey === "night" ? 
      ["early_night", "late_night"] 
      : [ payload.dataKey ]
  );

  const formatDayTime = (time: number | null) => time ? formatTime(time, data.timezone.utc_offset) : "-";

  const yTicks = [0, 7200, 14400, 21600, 28800, 36000, 43200, 50400, 57600, 64800, 72000, 79200, 86400]
  const tickFormatter = (seconds: number) => {
    const date = new Date(seconds * 1000);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)} ${ampm}`;
  };

  const CustomTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
    if (!active || !payload || !payload.length)
      return null;

    const day = payload[0].payload; // assert type

    return (
      <div>
        <p><strong>{ day.date }</strong></p>
        { Object.keys(events).map(key => {
          const event = events[key as EventKey];
          return (<p>
            {event.label}: {formatDayTime(day["dateUnix"] + day[key as EventKey])}
          </p>
        )})}
        <p>Day Length: {day.day_length}</p>
      </div>
    );
  };

  return <>
      <AreaChart width={1000} height={400} data={convertData(data)}>
        <XAxis dataKey="date" />
        <YAxis 
          domain={[0, MAX_DAY_LENGTH]}
          ticks={yTicks}
          tickFormatter={tickFormatter}
        />

        <Tooltip content={CustomTooltip}/>
        
        <Area stackId="1" type="linear" dataKey="night_1" stroke="none" fill="#A0C4FF" />
        <Area stackId="1" type="linear" dataKey="day_1" stroke="none" fill="#FFFFB3" />
        <Area stackId="1" type="linear" dataKey="night_2" stroke="none" fill="#A0C4FF" />
        <Area stackId="1" type="linear" dataKey="day_2" stroke="none" fill="#FFFFB3" />

        <Line type="linear" dot={false} dataKey="first_light" stroke="#A0C4FF"/>
        <Line type="linear" dot={false} dataKey="dawn" stroke="#BDB2FF" />
        <Line type="linear" dot={false} dataKey="solar_noon" stroke="#FFFFB3" />
        <Line type="linear" dot={false} dataKey="golden_hour" stroke="#FFADAD" strokeWidth={3} />
        <Line type="linear" dot={false} dataKey="dusk" stroke="#B0A1FF" />
        <Line type="linear" dot={false} dataKey="last_light" stroke="#A0C4FF" />

        <Legend onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
      </AreaChart>
  </>;
}

        // { Object.keys(events).map(key => (
        //   <Area key={key} type="monotone" dataKey={key} 
        //     stroke={events[key as EventKey].color} 
        //     fill={events[key as EventKey].color}
        //   />
        // ))}

