require "test_helper"

class Api::ServicesControllerTest < ActionDispatch::IntegrationTest
  test "GET /api/nutritionists/:id/services returns that nutritionist's services" do
    nutritionist = nutritionists(:john)
    get "/api/nutritionists/#{nutritionist.id}/services"
    assert_response :ok
    body = JSON.parse(response.body)
    assert_equal 1, body.length
    assert_equal "Online", body.first["service_type_name"]
    assert_equal "London", body.first["location_name"]
  end

  test "GET /api/nutritionists/:id/services/:service_id returns service for valid pair" do
    nutritionist = nutritionists(:john)
    service = services(:john_online_london)
    get "/api/nutritionists/#{nutritionist.id}/services/#{service.id}"
    assert_response :ok
    body = JSON.parse(response.body)
    assert_equal service.id, body["id"]
  end

  test "GET /api/nutritionists/:id/services/:service_id returns 404 for mismatched pair" do
    john = nutritionists(:john)
    emmas_service = services(:emma_clinic_manchester)
    get "/api/nutritionists/#{john.id}/services/#{emmas_service.id}"
    assert_response :not_found
    body = JSON.parse(response.body)
    assert_equal "NUTRITIONISTSERVICE.NOTFOUND", body["error"]
  end
end
