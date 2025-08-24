require "net/http"
require "uri"
require "json"
require "cgi"

class GeocodingService
  # Returns [latitude, longitude] for a location string, or nil if not found
  def self.geocode(location)
    encodedLocation = CGI.escape(location)
    url = URI("https://nominatim.openstreetmap.org/search?q=#{encodedLocation}&format=json&limit=1")
    response = Net::HTTP.get(url)
    data = JSON.parse(response)

    data.any? ? {
      latitude: data[0]["lat"].to_f,
      longitude: data[0]["lon"].to_f,
      name: data[0]["name"],
      fullname: data[0]["display_name"]
    } : nil
  rescue StandardError => e
    Rails.logger.error("Geocoding error: #{e.message}")
    nil
  end
end

