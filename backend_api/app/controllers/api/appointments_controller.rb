class Api::AppointmentsController < ApplicationController
  before_action :set_appointment, only: %i[ accept reject ]
  before_action :set_nutritionist, only: %i[ index create ]
  before_action :set_service, only: %i[ create ]

  # GET /nutritionists/1/appointments
  def index
    @appointments = Appointment.joins(:nutritionist_service)
      .where(nutritionist_services: { nutritionist_id: @nutritionist.id })
      .includes(nutritionist_service: { service: [ :service_type, :location ] })

    render json: AppointmentBlueprint.render(@appointments)
  end

  # POST /nutritionists/1/services/1/appointments
  def create
    @appointment = Appointment.new(appointment_params)
    @appointment.nutritionist_service = @nutritionist_service

    if @appointment.save
      pendingAppointments = Appointment.pending.where(
        "id <> ? AND patient_email = ?",
        @appointment.id,
        "#{@appointment.patient_email}"
      )

      pendingAppointments.each do |pendingApp|
        if !pendingApp.reject!
          render json: @appointment.errors, status: :unprocessable_content
        end
      end

      render json: @appointment, status: :created
    else
      render json: @appointment.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /appointments/1/accept
  def accept
    if @appointment.accept!
      # TODO: reject overlapping appointments for the same nutritionist
      NotifierMailer.appointment_accepted(@appointment.patient_email).deliver_now

      render json: AppointmentBlueprint.render(@appointment)
    else
      render json: @appointment.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /appointments/1
  def reject
    if @appointment.reject!
      NotifierMailer.appointment_rejected(@appointment.patient_email).deliver_now

      render json: AppointmentBlueprint.render(@appointment)
    else
      render json: @appointment.errors, status: :unprocessable_content
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_appointment
      @appointment = Appointment.find(params.expect(:id))
    end

    def set_nutritionist
      @nutritionist = Nutritionist.find(params.expect(:nutritionist_id))
    end

    def set_service
      @service = Service.find(params.expect(:service_id))

      @nutritionist_service = NutritionistService.find_by(
        nutritionist_id: @nutritionist.id,
        service_id: @service.id
      )
      unless @nutritionist_service
        return render json: { error: "NUTRITIONISTSERVICE.NOTFOUND" }, status: :not_found
      end
    end

    # Only allow a list of trusted parameters through.
    def appointment_params
      params.require(:appointment).permit(:patient_name, :patient_email, :scheduled_date, :status)
    end
end
