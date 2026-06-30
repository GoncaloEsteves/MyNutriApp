require "test_helper"

class Api::AppointmentsControllerTest < ActionDispatch::IntegrationTest
  def valid_appointment_params
    {
      appointment: {
        patient_name: "Carol Davis",
        patient_email: "carol@example.com",
        scheduled_date: "2026-08-01T09:00:00",
        status: "pending"
      }
    }
  end

  # --- index ---

  test "GET /api/nutritionists/:id/appointments returns that nutritionist's appointments" do
    john = nutritionists(:john)
    get "/api/nutritionists/#{john.id}/appointments"
    assert_response :ok
    body = JSON.parse(response.body)
    patient_names = body.map { |a| a["patient_name"] }
    assert_includes patient_names, "Alice Walker"
    assert_not_includes patient_names, "Bob Turner"
  end

  test "GET index includes service type, location and string status per appointment" do
    john = nutritionists(:john)
    get "/api/nutritionists/#{john.id}/appointments"
    assert_response :ok
    body = JSON.parse(response.body)
    appt = body.find { |a| a["patient_name"] == "Alice Walker" }
    assert_equal "Online", appt["service_type_name"]
    assert_equal "London", appt["location_name"]
    assert_equal "pending", appt["status"]
  end

  # --- create ---

  test "POST creates appointment and returns 201" do
    john = nutritionists(:john)
    service = services(:john_online_london)
    assert_difference "Appointment.count", 1 do
      post "/api/nutritionists/#{john.id}/services/#{service.id}/appointments",
          params: valid_appointment_params, as: :json
    end
    assert_response :created
  end

  test "POST returns 422 when patient_name is blank" do
    john = nutritionists(:john)
    service = services(:john_online_london)
    bad_params = valid_appointment_params.deep_merge(appointment: { patient_name: "" })
    assert_no_difference "Appointment.count" do
      post "/api/nutritionists/#{john.id}/services/#{service.id}/appointments",
          params: bad_params, as: :json
    end
    assert_response :unprocessable_entity
  end

  test "POST returns 400 when appointment key is missing" do
    john = nutritionists(:john)
    service = services(:john_online_london)
    assert_no_difference "Appointment.count" do
      post "/api/nutritionists/#{john.id}/services/#{service.id}/appointments",
          params: {}, as: :json
    end
    assert_response :bad_request
  end

  test "POST returns 404 when nutritionist-service pair does not match" do
    john = nutritionists(:john)
    emmas_service = services(:emma_clinic_manchester)
    assert_no_difference "Appointment.count" do
      post "/api/nutritionists/#{john.id}/services/#{emmas_service.id}/appointments",
          params: valid_appointment_params, as: :json
    end
    assert_response :not_found
  end

  # --- accept ---

  test "PATCH /api/appointments/:id/accept transitions to accepted" do
    appt = appointments(:pending_one)
    patch "/api/appointments/#{appt.id}/accept"
    assert_response :ok
    assert appt.reload.accepted?
    body = JSON.parse(response.body)
    assert_equal "accepted", body["status"]
    assert body.key?("service_type_name")
    assert body.key?("location_name")
  end

  test "PATCH /api/appointments/:id/accept returns 404 for unknown id" do
    patch "/api/appointments/0/accept"
    assert_response :not_found
  end

  # --- reject ---

  test "PATCH /api/appointments/:id/reject transitions to rejected" do
    appt = appointments(:pending_one)
    patch "/api/appointments/#{appt.id}/reject"
    assert_response :ok
    assert appt.reload.rejected?
    body = JSON.parse(response.body)
    assert_equal "rejected", body["status"]
    assert body.key?("service_type_name")
    assert body.key?("location_name")
  end

  test "PATCH /api/appointments/:id/reject returns 404 for unknown id" do
    patch "/api/appointments/0/reject"
    assert_response :not_found
  end
end
