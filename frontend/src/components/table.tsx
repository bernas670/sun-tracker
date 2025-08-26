import { useState } from "react";
import type { SunData } from "../types";
import { formatDate, formatSecToHMS, formatTime } from "../utils/datetime";

interface TableProps {
  data: SunData,
}

export default function Table({ data }: TableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rowsOptions = [10, 25, 50, 100];

  const totalPages = Math.ceil(data.days.length / rowsPerPage);

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const pageDays = data.days.slice(startIdx, endIdx);
  
  const formatDayTime = (time: number | null) => time ? formatTime(time) : "-";
  
  return <>
    <div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>First Light</th>
          <th>Dawn</th>
          <th>Sunrise</th>
          <th>Solar Noon</th>
          <th>Golden Hour</th>
          <th>Sunset</th>
          <th>Dusk</th>
          <th>Last Light</th>
          <th>Day Length</th>
        </tr>
      </thead>
      <tbody>
        {pageDays.map(day => (
          <tr key={ day.date }>
            <td>{ formatDate(day.date) }</td>
            <td>{ formatDayTime(day.first_light) }</td>
            <td>{ formatDayTime(day.dawn) }</td>
            <td>{ formatDayTime(day.sunrise) }</td>
            <td>{ formatDayTime(day.solar_noon) }</td>
            <td>{ formatDayTime(day.golden_hour) }</td>
            <td>{ formatDayTime(day.sunset) }</td>
            <td>{ formatDayTime(day.dusk) }</td>
            <td>{ formatDayTime(day.last_light) }</td>
            <td>{ formatSecToHMS(day.day_length) }</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="table-pagination" style={{ margin: "0.5em 1em", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2em" }}>
      <div className="table-pagination-left">
        <label htmlFor="rowsPerPage">Rows per page: </label>
        <select
          name="rowsPerPage"
          value={rowsPerPage}
          onChange={e => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1); 
          }}
        >
          {rowsOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="table-pagination-right">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span style={{ margin: "0 1em" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
    </div>
  </>
}
