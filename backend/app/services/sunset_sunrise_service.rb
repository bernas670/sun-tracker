require "net/http"
require "uri"
require "json"
require "cgi"

class SunsetSunriseService
  def self.get(latitude, longitude, dates)
    urlString = "https://api.sunrisesunset.io/json?lat=#{latitude}&lng=#{longitude}"

    if dates.length == 1
      urlString << "&date=#{dates.first}"
    elsif dates.length > 1
      urlString << "&date_start=#{dates.first}&date_end=#{dates.last}"
    else
      nil
    end

    url = URI(urlString)
    response = Net::HTTP.get(url)
    data = JSON.parse(response)

    if !data.any?
      nil
    end

    results = data["results"]
    results = results.is_a?(Array) ? results : [ results ]

    dates_set = dates.map { |date| date.to_s }.to_set

    results
      .select { |event| dates_set.include?(event["date"]) }
      .map do |event|
        event = format_event(event, latitude)
        Event.new(event.merge(latitude: latitude, longitude: longitude))
      end
  rescue StandardError => e
    Rails.logger.error("SunsetSunrise error: #{e.message}")
    nil
  end


  def self.format_event(event, latitude)
    date = event["date"]

    fields = [ "sunrise", "sunset", "first_light", "last_light", "dawn", "solar_noon", "dusk", "golden_hour" ]
    fields.each do |key|
      next if event[key].nil?
      event[key] = to_unixtime(date, event[key])
    end

    event["utc_offset"] = event["utc_offset"].to_i * 60
    event["day_length"] = calculate_day_length(event, latitude, event["utc_offset"])

    event
  end


  def self.to_unixtime(date, timestamp)
    if timestamp.nil?
      nil
    end

    datetime_str = "#{date} #{timestamp}"
    datetime = DateTime.strptime(datetime_str, "%Y-%m-%d %I:%M:%S %p")
    datetime.to_time.to_i
  end


  def self.calculate_day_length(event, latitude, utc_offset)
    sunrise = event["sunrise"]
    sunset = event["sunset"]

    date = Date.parse(event["date"])

    if sunrise.nil? && sunset.nil?
      day_length = polar_day_length(latitude, date)
    elsif !sunrise.nil? && !sunset.nil?
      day_length = sunset.to_i - sunrise.to_i
      day_length = day_length >= 0 ? day_length : 24 * 60 * 60 + day_length
    elsif !sunrise.nil?
      end_of_day = (date + 1).to_time(:utc).to_i - 1
      day_length = end_of_day - sunrise.to_i
    elsif !sunset.nil?
      start_of_day = date.to_time(:utc).to_i
      day_length = sunset.to_i - start_of_day
    end

    day_length
  end

  def self.polar_day_length(latitude, date)
    month = date.month

    if latitude > 0
      # northern hemisphere
      month >= 3 && month <= 9 ? 24 * 60 * 60 : 0
    else
      month <= 3 || month >= 9 ? 24 * 60 * 60 : 0
    end
  end

end

