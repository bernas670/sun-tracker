require "test_helper"

class V1::EventsControllerTest < ActionDispatch::IntegrationTest
  test "should succeed with valid parameters" do
    get v1_events_url, params: { location: "New York", start_date: "2025-01-01", end_date: "2025-12-31" }
    assert_response :success
  end

  test "should fail with missing location" do
    get v1_events_url, params: { start_date: "2025-01-01", end_date: "2025-12-31" }
    assert_response :bad_request
    body = JSON.parse(response.body)
    assert_match (/location/), body["error"]
  end

  test "should fail with missing start_date" do
    get v1_events_url, params: { location: "New York", end_date: "2025-12-31" }
    assert_response :bad_request
    body = JSON.parse(response.body)
    assert_match /start_date/, body["error"]
  end

  test "should succeed with missing end_date" do
    get v1_events_url, params: { location: "New York", start_date: "2025-01-01" }
    assert_response :success
  end

  test "should fail with malformed start_date" do
    get v1_events_url, params: { location: "New York", start_date: "not-a-date", end_date: "2025-12-31" }
    assert_response :bad_request
    body = JSON.parse(response.body)
    assert_match /start_date/, body["error"]
  end

  test "should fail with malformed end_date" do
    get v1_events_url, params: { location: "New York", start_date: "2025-01-01", end_date: "not-a-date" }
    assert_response :bad_request
    body = JSON.parse(response.body)
    assert_match /end_date/, body["error"]
  end

  test "should fail if date range exceeds 365 days" do
    get v1_events_url, params: { location: "New York", start_date: "2025-01-01", end_date: "2026-01-02" }
    assert_response :bad_request
    body = JSON.parse(response.body)
    assert_match /365 days/, body["error"]
  end

  test "should succeed if date range is exactly 365 days" do
    get v1_events_url, params: { location: "New York", start_date: "2025-01-01", end_date: "2026-01-01" }
    assert_response :success
  end
end
