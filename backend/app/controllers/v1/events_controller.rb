class V1::EventsController < ApplicationController

  FIELDS = [ :date, :sunrise, :sunset, :first_light, :last_light, :dawn, :dusk, :solar_noon, :golden_hour, :day_length, :utc_offset, :timezone ].freeze

  def index
    unless valid_params?
      return
    end

    location = GeocodingService.geocode(params[:location])
    if location.nil?
      render json: { error: "location not found" }, status: :bad_request
      return
    end
    latitude, longitude = location.values_at(:latitude, :longitude)

    start_date = Date.parse(params[:start_date])
    end_date = Date.parse(params[:end_date] || params[:start_date])

    # get events from database
    date_range = start_date..end_date
    cached_events = Event.where(latitude: latitude, longitude: longitude, date: date_range).select(*FIELDS)

    # check if any days are missing
    requested_dates = date_range.to_set
    cached_dates = cached_events.map(&:date).to_set
    missing_dates = (requested_dates - cached_dates).to_a.sort

    if !missing_dates.empty?
      missing_events = SunsetSunriseService.get(latitude, longitude, missing_dates.first, missing_dates.last)
      if missing_events.nil?
        render json: { error: "No data found" }, status: :bad_request
        return
      end

      all_events = cached_events + missing_events
      unique_events = all_events.uniq(&:date)
      events = unique_events.sort_by(&:date)

      missing_hashes = missing_events.map { |event| event.attributes.except("id", "created_at", "updated_at") }
      Event.insert_all(missing_hashes, unique_by: :index_events_on_latitude_and_longitude_and_date)
    end

    response_events = events || cached_events

    render json: {
      days: response_events.map { |event| event.slice(*FIELDS).except("timezone") },
      location: location,
      timezone: response_events.first.timezone
    }
  end


  private

  def valid_coords?(lat, lng)
    Float(params[:lat]) && Float(params[:lng]) rescue false
  end

  def valid_params?
    # location, lat and lng validation
    if params[:location].present?
      unless params[:location].is_a?(String) && !params[:location].strip.empty?
        render json: { error: "location must be a non-empty string" }, status: :bad_request
        return false
      end
    else
      render json: { error: "location is required" }, status: :bad_request
      return false
    end


    # start date validation
    unless params[:start_date].present?
      render json: { error: "start_date is required" }, status: :bad_request
      return false
    end

    begin
      start_date = Date.parse(params[:start_date])
    rescue ArgumentError
      render json: { error: "start_date must be a valid date" }, status: :bad_request
      return false
    end


    # end date validation
    if params[:end_date].present?
      begin
        end_date = Date.parse(params[:end_date])
      rescue ArgumentError
        render json: { error: "end_date must be a valid date" }, status: :bad_request
        return false
      end

      if end_date < start_date
        render json: { error: "end_date must be after start_date" }, status: :bad_request
        return false
      end

      if (end_date - start_date).to_i > 365
        render json: { error: "date range cannot exceed 365 days" }, status: :bad_request
        return false
      end
    end

    true
  end
end
