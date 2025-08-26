require "test_helper"

class GeocodingServiceTest < ActiveSupport::TestCase
  test "returns coordinates for valid location" do
    # Stub external API call if needed
    result = GeocodingService.geocode("New York")
    assert result.is_a?(Hash)
    assert_in_delta 40.7, result[:latitude], 0.5
    assert_in_delta -74.0, result[:longitude], 0.5
  end

  test "returns nil for invalid location" do
    result = GeocodingService.geocode("NotARealPlace")
    assert_nil result
  end

  test "returns nil for empty location" do
    result = GeocodingService.geocode("")
    assert_nil result
  end

  test "returns nil for whitespace location" do
    result = GeocodingService.geocode("    ")
    assert_nil result
  end

  test "returns nil for malformed location" do
    result = GeocodingService.geocode("asdfsadf12345asdf")
    assert_nil result
  end

  test "trims whitespace and returns correct coordinates" do
    result = GeocodingService.geocode("  Paris  ")
    assert result.is_a?(Hash)
    assert_in_delta 48.8, result[:latitude], 0.5
    assert_in_delta 2.3, result[:longitude], 0.5
  end
end

