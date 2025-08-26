export interface Day {
  date: string;
  sunrise: number | null;
  sunset: number | null;
  first_light: number | null;
  last_light: number | null;
  dawn: number | null;
  dusk: number | null;
  solar_noon: number | null;
  golden_hour: number | null;
  day_length: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  fullname: string;
}

export interface SunData {
  days: Day[];
  location: Location;
  timezone: string;
}

