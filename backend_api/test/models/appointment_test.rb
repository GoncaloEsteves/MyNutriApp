require "test_helper"

class AppointmentTest < ActiveSupport::TestCase
  def valid_params
    {
      nutritionist_service: nutritionist_services(:john_online),
      patient_name: "Carol Davis",
      patient_email: "carol@example.com",
      scheduled_date: "2026-08-01T09:00:00"
    }
  end

  test "saves with valid attributes and defaults to pending" do
    appt = Appointment.new(valid_params)
    assert appt.save
    assert appt.pending?
  end

  test "invalid without patient_name" do
    appt = Appointment.new(valid_params.merge(patient_name: nil))
    assert_not appt.valid?
    assert_includes appt.errors[:patient_name], "can't be blank"
  end

  test "invalid without patient_email" do
    appt = Appointment.new(valid_params.merge(patient_email: nil))
    assert_not appt.valid?
    assert_includes appt.errors[:patient_email], "can't be blank"
  end

  test "invalid without scheduled_date" do
    appt = Appointment.new(valid_params.merge(scheduled_date: nil))
    assert_not appt.valid?
    assert_includes appt.errors[:scheduled_date], "can't be blank"
  end

  test "accept! transitions pending to accepted" do
    appt = appointments(:pending_one)
    assert appt.pending?
    assert appt.accept!
    appt.reload
    assert appt.accepted?
  end

  test "reject! transitions pending to rejected" do
    appt = appointments(:pending_one)
    assert appt.reject!
    appt.reload
    assert appt.rejected?
  end

  test "status enum exposes predicate methods" do
    assert appointments(:pending_one).pending?
    assert appointments(:accepted_one).accepted?
  end
end
