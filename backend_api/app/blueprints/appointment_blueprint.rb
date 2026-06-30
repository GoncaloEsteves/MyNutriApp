class AppointmentBlueprint < Blueprinter::Base
  fields :id, :patient_name, :patient_email, :scheduled_date, :status

  field :service_type_name do |appointment|
    appointment.nutritionist_service.service.service_type.name
  end

  field :location_name do |appointment|
    appointment.nutritionist_service.service.location.name
  end
end
