require "net/http"
require "uri"
require "json"
require "cgi"

class SunsetSunriseService
  def self.get(latitude, longitude, start_date, end_date = nil)
    urlString = "https://api.sunrisesunset.io/json?lat=#{latitude}&lng=#{longitude}&time_format=unix"
    if end_date.nil?
      urlString << "&date=#{start_date}"
    else
      urlString << "&date_start=#{start_date}&date_end=#{end_date}"
    end

    url = URI(urlString)
    response = Net::HTTP.get(url)
    data = JSON.parse(response)


    if !data.any?
      nil
    end

    results = data["results"]
    results = results.is_a?(Array) ? results : [ results ]


    results.map do |event|
      event = calculate_day_length(event)
      Event.new(event.merge(latitude: latitude, longitude: longitude))
    end
  rescue StandardError => e
    Rails.logger.error("SunsetSunrise error: #{e.message}")
    nil
  end

  def self.calculate_day_length(event)
    sunrise = event["sunrise"].to_i
    sunset = event["sunset"].to_i

    if !sunrise.nil? && !sunset.nil?
      day_length = sunset - sunrise
    elsif sunrise.nil? && sunset.nil?
      day_length = event["golden_hour"].nil? ? 0 : 24 * 60 * 60
    else
      date = Date.parse(event["date"])
      if !sunrise.nil?
        end_of_day = (date + 1).to_time(:utc).to_i - 1
        day_length = end_of_day - sunrise
      elif !sunset.nil?
        start_of_day = date.to_time(:utc).to_i
        day_length = sunset - start_of_day
      end
    end

    event["day_length"] = day_length
    event
  end
end

