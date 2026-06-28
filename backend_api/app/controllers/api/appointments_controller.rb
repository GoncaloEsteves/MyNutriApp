class Api::AppointmentsController < ApplicationController
  before_action :set_appointment, only: %i[ show accept reject ]

  # GET /appointments
  def index
    @appointments = Appointment.all

    render json: @appointments
  end

  # GET /appointments/1
  def show
    render json: @appointment
  end

  # POST /appointments
  def create
    @appointment = Appointment.new(appointment_params)

    if @appointment.save
      render json: @appointment, status: :created
    else
      render json: @appointment.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /appointments/1/accept
  def accept
    if @appointment.accept!
      render json: @appointment
    else
      render json: @appointment.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /appointments/1
  def reject
    if @appointment.reject!
      render json: @appointment
    else
      render json: @appointment.errors, status: :unprocessable_content
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_appointment
      @appointment = Appointment.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def appointment_params
      params.require(:patient_name)
      params.require(:patient_email)
      params.require(:scheduled_date)
      params.require(:nutritionist_service_id)
      params.expect(appointment: [ :patient_name, :patient_email, :scheduled_date, :status, :nutritionist_service_id ])
    end
end
