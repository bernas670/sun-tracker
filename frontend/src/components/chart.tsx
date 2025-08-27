import { Area, AreaChart, Line, Tooltip, XAxis, YAxis, ResponsiveContainer, type TooltipContentProps } from "recharts";
import type { Day, SunData } from "../types";
import { dateToUnix, formatDate, formatSecToHMS, formatTime } from "../utils/datetime";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import React, { useState } from "react";

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

   const lineKeys = Object.keys(events) as EventKey[];
   const [visibleLines, setVisibleLines] = useState<Record<EventKey, boolean>>(
     () => Object.fromEntries(lineKeys.map(key => [key, true])) as Record<EventKey, boolean>
   );

   const toggleLine = (key: EventKey) => {
     setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));
   };

   const toggleAllLines = () => {
     const allEnabled = lineKeys.every(key => visibleLines[key]);
     setVisibleLines(Object.fromEntries(lineKeys.map(key => [key, !allEnabled])) as Record<EventKey, boolean>);
   };

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

     const day = payload[0].payload;

     return (
       <div
         style={{
           background: "white",
           border: "1px solid #ddd",
           borderRadius: "10px",
           boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
           padding: "1rem 1.25rem",
           minWidth: 220,
           fontSize: "1rem"
         }}
       >
         <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
           {formatDate(day.date)}
         </div>
         <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr", gap: "0.4rem", marginBottom: "0.5rem" }}>
           {Object.keys(events).map(key => {
             const event = events[key as EventKey];
             const timeValue = day[key as EventKey];
             if (timeValue == null) return null;
             return (
               <React.Fragment key={`${key}-${day["dateUnix"]}`}>
                 <span
                   style={{
                     width: 18,
                     height: 18,
                     display: "inline-block",
                     borderRadius: 4,
                     background: event.color,
                     border: "1px solid #ccc",
                     marginRight: 2
                   }}
                   title={event.label}
                 />
                 <span style={{ fontWeight: 500 }}>{event.label}</span>
                 <span style={{ textAlign: "right" }}>
                   {formatDayTime(day["dateUnix"] + timeValue)}
                 </span>
               </React.Fragment>
             );
           })}
         </div>
         <div style={{ fontWeight: 600, color: "#555", fontSize: "0.95rem", marginTop: "0.5rem" }}>
           Day Length: <span style={{ fontWeight: 700, color: "#222" }}>{day.day_length}</span>
         </div>
       </div>
     );
   };

   return (
      <div style={{ width: "100%", minHeight: 400 }}>
        {/* Checkbox controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
          {lineKeys.map(key => (
            <span
              key={key}
              onClick={() => toggleLine(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                cursor: "pointer",
                userSelect: "none"
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  display: "inline-block",
                  borderRadius: 6,
                  border: "2px solid #ccc",
                  background: visibleLines[key] ? events[key].color : "transparent",
                  transition: "background 0.2s"
                }}
                title={events[key].label}
              />
              {events[key].label}
            </span>
          ))}
          <button type="button" onClick={toggleAllLines} style={{ marginLeft: "1.5rem", padding: "0.5rem 1.25rem", fontSize: "1rem" }}>Toggle All</button>
        </div>

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

              {/* Render only enabled lines */}
              {lineKeys.map(key => (
                visibleLines[key] && (
                  <Line
                    key={key}
                    type="linear"
                    dot={false}
                    dataKey={key}
                    stroke={events[key].color}
                    strokeWidth={4}
                  />
                )
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
 }

