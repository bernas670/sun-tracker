import { useState } from "react";
import type { SunData } from "../types";
import { fetchSunData } from "../api/sunTracker";

interface FormData {
  location: string,
  startDate: string,
  endDate: string,
}

interface FormErrors {
  location?: string,
  startDate?: string,
  endDate?: string,
  form?: string,
}

interface FormProps {
  onDataReceived: (data: SunData) => void;
  onError: (message: string) => void;
}

export default function Form({ onDataReceived, onError }: FormProps) {
  const [formData, setFormData] = useState<FormData>({
    location: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid(formData))
      return;

    setIsLoading(true);
    
    try {
      const data = await fetchSunData(formData.location, formData.startDate, formData.endDate);
      onDataReceived(data);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      onError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid = ({location, startDate, endDate}: FormData) => {
    const errors: FormErrors = {};

    if (!location.trim()) errors.location = "Location is required.";
    if (!startDate.trim()) errors.startDate = "Start date is required.";
    if (!endDate.trim()) errors.endDate = "End date is required.";

    // Check valid dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (startDate && isNaN(start.getTime())) errors.startDate = "Start date is invalid.";
    if (endDate && isNaN(end.getTime())) errors.endDate = "End date is invalid.";

    // Check end > start
    if (!errors.startDate && !errors.endDate && end <= start) {
      errors.form = "End date must be after start date.";
    }

    setErrors(errors);

    return !Object.keys(errors).length
  }

  return (
    <form onSubmit={handleSubmit} >
      <div className="date-input">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
        />
        {errors.location && <div className="error-message">{errors.location}</div>}
      </div>

      <div className="date-row">
        <div className="date-input">
          <label htmlFor="startDate">From</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
          />
          {errors.startDate && <div className="error-message">{errors.startDate}</div>}
        </div>
        <div className="date-input">
          <label htmlFor="endDate">To</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
          />
          {errors.endDate && <div className="error-message">{errors.endDate}</div>}
        </div>
      </div>
      {errors.form && <div className="error-message">{errors.form}</div>}
      <button 
        type="submit"
        disabled={isLoading}
      >
        Get Solar Data
      </button>
    </form>
  )
}
