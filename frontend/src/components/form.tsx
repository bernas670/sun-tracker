import { useState } from "react";
import type { SunData } from "../types";
import { fetchSunData } from "../api/sunTracker";

interface FormData {
  location: string,
  startDate: string,
  endDate: string,
}

interface FormProps {
  onDataReceived: (data: SunData) => void;
}

export default function Form({ onDataReceived }: FormProps) {
  const [formData, setFormData] = useState<FormData>({
    location: "",
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // if (!formData.location || !formData.startDate || !formData.endDate) {
    //   return;
    // }
    // todo: validate the inputs

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchSunData(formData.location, formData.startDate, formData.endDate);
      onDataReceived(data);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} >
      <label htmlFor="location">Location</label>
      <input
        type="text"
        id="location"
        name="location"
        value={formData.location}
        onChange={handleInputChange}
      />

      <label htmlFor="startDate">From</label>
      <input
        type="date"
        id="startDate"
        name="startDate"
        value={formData.startDate}
        onChange={handleInputChange}
      />

      <label htmlFor="endDate">To</label>
      <input
        type="date"
        id="endDate"
        name="endDate"
        value={formData.endDate}
        onChange={handleInputChange}
      />

      <button 
        type="submit"
        disabled={isLoading}
      >
        Get Solar Data
      </button>
    </form>
  )
}
