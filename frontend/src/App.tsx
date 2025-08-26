import { useEffect, useState } from 'react'
import './App.css'
import Form from './components/form'
import type { SunData } from './types'
import { fetchSunData } from './api/sunTracker';
import Table from './components/table';
import Chart from './components/chart';

function App() {
  const [sunData, setSunData] = useState<SunData>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDataFromUrl = async () => {
      // todo: modify this, location will not be one of the params (only lat and lng)
      const urlParams = new URLSearchParams(window.location.search);
      const location = urlParams.get("location");
      const lat = urlParams.get("lat");
      const lng = urlParams.get("lng");
      const startDate = urlParams.get("start_date");
      const endDate = urlParams.get("end_date");

      if (location && startDate && endDate) {
        setIsLoading(true);
        try {
          const data = await fetchSunData(location, startDate, endDate);
          setSunData(data);
        } catch (error) {
          // todo: handle this error
          console.log("Failed to load data: ", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDataFromUrl();
  }, [])

  const handleReceivedData = (data: SunData) => {
    console.log(data);
    setSunData(data);

    const params = new URLSearchParams({
      location: data.location.name,
      lat: data.location.latitude.toString(),
      lng: data.location.longitude.toString(),
      start_date: data.days[0].date,
      end_date: data.days[data.days.length - 1].date,
    });
    window.history.replaceState({}, "", `?${params.toString()}`);
  }

  return (
    <>
      <div className="content-wrapper">
      <header>
        <h1>SunTracker</h1>
        <p>Historical sunrise & sunset data</p>
      </header>

      <main>
        <Form onDataReceived={handleReceivedData} />

        {isLoading && (
          <p>Loading solar data...</p>
        )}

        {sunData && (<>
          <div>
            <h1>{sunData.location.name}</h1>
            <p>{sunData.days[0].date} - {sunData.days[sunData.days.length - 1].date}</p>
          </div>

          <Chart data={sunData} /> 
          <Table data={sunData} />
        </>)}
      </main>

      <footer>
        <p>Powered by <a href="https://sunrisesunset.io/">SunriseSunset.io</a></p>
      </footer>
      </div>
    </>
  )
}

export default App
