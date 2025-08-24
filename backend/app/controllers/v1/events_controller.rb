class V1::EventsController < ApplicationController
  def index
    # validate parameters
    required_params = [ :location, :start_date ]
    missing = required_params.select { |p| !params[p].present? }
    if missing.any?
      render json: { error: "Missing required parameter(s): #{missing.join(', ')}" }, status: :bad_request
      return
    end

    unless params[:location].is_a?(String) && !params[:location].strip.empty?
      render json: { error: "Location must be a non-empty string" }
      return
    end

    begin
      start_date = Date.parse(params[:start_date])
    rescue ArgumentError
      render json: { error: "Start date must be a valid date" }, status: :bad_request
      return
    end

    if params[:end_date].present?
      begin
        end_date = Date.parse(params[:end_date])
      rescue ArgumentError
        render json: { error: "Start date must be a valid date" }, status: :bad_request
        return
      end

      if end_date < start_date
        render json: { error: "End date must be after start date" }, status: :bad_request
        return
      end
    end


    # location to coordinates
    location = GeocodingService.geocode(params[:location])
    if location.nil?
      render json: { error: "Location not found" }, status: bad_request
      return
    end
    latitude, longitude = location.values_at(:latitude, :longitude)


    # get events from database
    fields = [ :date, :sunrise, :sunset, :first_light, :last_light, :dawn, :dusk, :solar_noon, :golden_hour, :day_length ]
    date_range = params[:end_date].present? ? start_date..end_date : [ start_date ]
    cached_events = Event.where(latitude: latitude, longitude: longitude, date: date_range).select(*fields)


    # check if any days are missing
    requested_dates = date_range.to_set
    cached_dates = cached_events.map(&:date).to_set
    missing_dates = (requested_dates - cached_dates).to_a.sort

    if !missing_dates.empty?
      missing_events = SunsetSunriseService.get(latitude, longitude, missing_dates.first, missing_dates.last)
      if missing_events.nil?
        render json: { error: "No data found" }, status: bad_request
        return
      end

      all_events = cached_events + missing_events
      unique_events = all_events.uniq(&:date)
      events = unique_events.sort_by(&:date)

      missing_hashes = missing_events.map { |event| event.attributes.except("id", "created_at", "updated_at") }
      Event.insert_all(missing_hashes, unique_by: :index_events_on_latitude_and_longitude_and_date)
    end


    response_events = events || cached_events
    response_events = response_events.map { |event| event.slice(*fields) }

    response = {
      days: response_events,
      location: location,
      timezone: {
        label: "UTC",
        utc_offset: 0
      }
    }
    render json: response
  end
end
