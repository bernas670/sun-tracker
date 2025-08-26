import { Area, AreaChart, Line, Tooltip, XAxis, YAxis, ResponsiveContainer, type TooltipContentProps } from "recharts";
import type { Day, SunData } from "../types";
import { dateToUnix, formatDate, formatSecToHMS, formatTime } from "../utils/datetime";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";


interface ChartProps {
  data: SunData,
}

type EventKey = keyof Omit<Day, "date" | "day_length">;
type Event = { [K in EventKey]: { label: string, color: string } };


const events: Event = {
  first_light: { label: "First Light", color: "var(--chart-first-light)" },
  dawn: { label: "Dawn", color: "var(--chart-dawn)" },
  sunrise: { label: "Sunrise", color: "var(--chart-sunrise)" },
  solar_noon: { label: "Solar Noon", color: "var(--chart-solar-noon)" },
  golden_hour: { label: "Golden Hour", color: "var(--chart-golden-hour)" },
  sunset: { label: "Sunset", color: "var(--chart-sunset)" },
  dusk: { label: "Dusk", color: "var(--chart-dusk)" },
  last_light: { label: "Last Light", color: "var(--chart-last-light)" },
}

export default function Chart({ data }: ChartProps) {

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
      date: day.date,
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


  const formatDayTime = (time: number | null) => time ? formatTime(time) : "-";

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
        <p><strong>{ formatDate(day.date) }</strong></p>
        { Object.keys(events).map(key => {
          const event = events[key as EventKey];
          return (<p key={`${key}-${day["dateUnix"]}`}>
            {event.label}: {formatDayTime(day["dateUnix"] + day[key as EventKey])}
          </p>
        )})}
        <p>Day Length: {day.day_length}</p>
      </div>
    );
  };

   return (
     <div style={{ width: "100%", minHeight: 400 }}>
       <div style={{ width: "100%", height: 400 }}>
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={convertData(data)}>
            <XAxis dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
               tickFormatter={(date) => new Date(date).toLocaleDateString("en-GB")}
              textAnchor="end"
              height={70}
              />
             <YAxis 
               domain={[0, MAX_DAY_LENGTH]}
               ticks={yTicks}
               tickFormatter={tickFormatter}
               tick={{ fontSize: 12 }}
               width={70}
             />
             <Tooltip content={CustomTooltip}/>

             <Area stackId="1" type="linear" dataKey="night_1" stroke="none" fill="var(--chart-night)" />
             <Area stackId="1" type="linear" dataKey="day_1" stroke="none" fill="var(--chart-day)" />
             <Area stackId="1" type="linear" dataKey="night_2" stroke="none" fill="var(--chart-night)" />
             <Area stackId="1" type="linear" dataKey="day_2" stroke="none" fill="var(--chart-day)" />

             <Line type="linear" dot={false} dataKey="first_light" stroke="var(--chart-first-light)"/>
             <Line type="linear" dot={false} dataKey="dawn" stroke="var(--chart-dawn)" />
             <Line type="linear" dot={false} dataKey="solar_noon" stroke="var(--chart-solar-noon)" />
             <Line type="linear" dot={false} dataKey="golden_hour" stroke="var(--chart-golden-hour)" strokeWidth={3} />
             <Line type="linear" dot={false} dataKey="dusk" stroke="var(--chart-dusk)" />
             <Line type="linear" dot={false} dataKey="last_light" stroke="var(--chart-last-light)" />
           </AreaChart>
         </ResponsiveContainer>
       </div>
     </div>
   );
 }

        // { Object.keys(events).map(key => (
        //   <Area key={key} type="monotone" dataKey={key} 
        //     stroke={events[key as EventKey].color} 
        //     fill={events[key as EventKey].color}
        //   />
        // ))}

