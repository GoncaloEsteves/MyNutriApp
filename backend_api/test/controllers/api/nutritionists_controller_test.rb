require "test_helper"

class Api::NutritionistsControllerTest < ActionDispatch::IntegrationTest
  test "GET /api/nutritionists returns all nutritionists with services" do
    get "/api/nutritionists"
    assert_response :ok
    body = JSON.parse(response.body)
    names = body.map { |n| n["name"] }
    assert_includes names, "John Smith"
    assert_includes names, "Emma Brown"
  end

  test "GET /api/nutritionists filters by name via searchBy" do
    get "/api/nutritionists", params: { searchBy: "John" }
    assert_response :ok
    body = JSON.parse(response.body)
    assert_equal 1, body.length
    assert_equal "John Smith", body.first["name"]
  end

  test "GET /api/nutritionists filters by service type name via searchBy" do
    get "/api/nutritionists", params: { searchBy: "Online" }
    assert_response :ok
    body = JSON.parse(response.body)
    assert_equal 1, body.length
    assert_equal "John Smith", body.first["name"]
  end

  test "GET /api/nutritionists filters by location" do
    get "/api/nutritionists", params: { location: "London" }
    assert_response :ok
    body = JSON.parse(response.body)
    assert_equal 1, body.length
    assert_equal "John Smith", body.first["name"]
  end

  test "GET /api/nutritionists/:id returns the nutritionist" do
    id = nutritionists(:john).id
    get "/api/nutritionists/#{id}"
    assert_response :ok
    body = JSON.parse(response.body)
    assert_equal "John Smith", body["name"]
  end

  test "GET /api/nutritionists/:id returns 404 for unknown id" do
    get "/api/nutritionists/0"
    assert_response :not_found
  end
end
