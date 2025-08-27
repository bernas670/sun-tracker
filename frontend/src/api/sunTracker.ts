import type { SunData } from "../types";

const API_URL = import.meta.env.VITE_API_URL

export async function fetchSunData(
  location: string,
  startDate: string,
  endDate: string
): Promise<SunData> {
  const url = `${API_URL}/v1/events?location=${location}&start_date=${startDate}&end_date=${endDate}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch sun data");
  }

  return response.json();
}
