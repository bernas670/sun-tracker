import { useEffect, useState } from 'react'
import './App.css'
import Form from './components/form'
import type { SunData } from './types'
import { fetchSunData } from './api/sunTracker';
import Table from './components/table';
import Chart from './components/chart';
import ShareButton from './components/share_button';

function App() {
  const [sunData, setSunData] = useState<SunData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  useEffect(() => {
    const fetchDataFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const location = urlParams.get("location");

      const startDate = urlParams.get("start_date");
      const endDate = urlParams.get("end_date");

      if (location && startDate && endDate) {
        setIsLoading(true);
        try {
          const data = await fetchSunData(location, startDate, endDate);
          setError(null);
          setSunData(data);
        } catch (err) {
          handleError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDataFromUrl();
  }, [])

  const handleReceivedData = (data: SunData) => {
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

  const handleError = (message: string) => {
    setError(message);
    setShowErrorPopup(true);
  }

  return (
    <>
      <div className="content-wrapper">
      <header className="site-header">
        <div className="header-content">
          <h1>SunTracker</h1>
          <p>Historical sunrise & sunset data</p>
        </div>
      </header>

      <main className="centered-content">
        <div className="card form-card">
          <Form onDataReceived={handleReceivedData} onError={handleError} />
        </div>

        {showErrorPopup && (
          <div className="modal-overlay">
            <div className="modal">
              <p>{error}</p>
              <button onClick={() => setShowErrorPopup(false)}>Close</button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="card loading-card">
            <p>Loading solar data...</p>
          </div>
        )}

        {sunData && (
          <div className="card results-card">
            <div className="results-header">
              <div className="results-header-left">
                <h2>{sunData.location.name}<span className="annotation">{sunData.timezone}</span></h2>
                <p className="subtitle">{sunData.days[0].date} - {sunData.days[sunData.days.length - 1].date}</p>
              </div>
              <div className="results-header-right">
                <ShareButton />
              </div>
            </div>
            <Chart data={sunData} />
            <Table data={sunData} />
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <p>Powered by <a href="https://sunrisesunset.io/">SunriseSunset.io</a></p>
        </div>
      </footer>
      </div>
    </>
  )
}

export default App
