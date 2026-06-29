# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Nutritionists
nutritionists = [
  "João Silva", "Maria Oliveira", "Carlos Santos", "Ana Costa"
].map { |name| Nutritionist.find_or_create_by!(name: name) }

puts "Seeded #{nutritionists.count} nutritionists"

# Locations
location_data = [
  { name: "Braga",   latitude: 41.5454, longitude: -8.4265 },
  { name: "Porto",   latitude: 41.1496, longitude: -8.6109 },
  { name: "Lisboa",  latitude: 38.7169, longitude: -9.1396 }
]
locations = location_data.map { |attrs| Location.find_or_create_by!(attrs) }

puts "Seeded #{locations.count} locations"

# Service types
service_types = [
  "SERVICETYPE.HOMEAPPOINTMENT", "SERVICETYPE.CLINICAPPOINTMENT", "SERVICETYPE.ONLINEAPPOINTMENT"
].map { |name| ServiceType.find_or_create_by!(name: name) }

puts "Seeded #{service_types.count} service types"

# Services (duration in minutes as integer)
service_data = [
  { location: locations[0], service_type: service_types[0], price: 70.0, duration: 60 },
  { location: locations[0], service_type: service_types[1], price: 50.0, duration: 45 },
  { location: locations[1], service_type: service_types[1], price: 60.0, duration: 60 },
  { location: locations[0], service_type: service_types[2], price: 30.0, duration: 30 },
  { location: locations[1], service_type: service_types[2], price: 30.0, duration: 30 },
  { location: locations[2], service_type: service_types[2], price: 30.0, duration: 30 }
]
services = service_data.map { |attrs| Service.find_or_create_by!(attrs) }

puts "Seeded #{services.count} services"

# Nutritionist services
nutritionist_service_data = [
  { nutritionist: nutritionists[0], service: services[0] },
  { nutritionist: nutritionists[0], service: services[1] },
  { nutritionist: nutritionists[1], service: services[1] },
  { nutritionist: nutritionists[2], service: services[2] },
  { nutritionist: nutritionists[3], service: services[3] },
  { nutritionist: nutritionists[3], service: services[4] },
  { nutritionist: nutritionists[3], service: services[5] }
]
nutritionist_services = nutritionist_service_data.map { |attrs| NutritionistService.find_or_create_by!(attrs) }

puts "Seeded #{nutritionist_services.count} nutritionist services"

# Appointments
appointment_data = [
  # João Silva (nutritionist 0) — services 0 and 1
  { patient_name: "Bruno Mendes",    patient_email: "bruno.mendes@example.com",    nutritionist_service: nutritionist_services[0], scheduled_date: Time.new(2026, 7, 21,  9, 0, 0) },
  { patient_name: "Marta Sousa",     patient_email: "marta.sousa@example.com",     nutritionist_service: nutritionist_services[0], scheduled_date: Time.new(2026, 7, 22, 11, 0, 0) },
  { patient_name: "Filipe Nunes",    patient_email: "filipe.nunes@example.com",    nutritionist_service: nutritionist_services[1], scheduled_date: Time.new(2026, 7, 21, 14, 0, 0) },
  { patient_name: "Catarina Dias",   patient_email: "catarina.dias@example.com",   nutritionist_service: nutritionist_services[1], scheduled_date: Time.new(2026, 7, 23, 10, 0, 0) },

  # Maria Oliveira (nutritionist 1) — service 1
  { patient_name: "André Fonseca",   patient_email: "andre.fonseca@example.com",   nutritionist_service: nutritionist_services[2], scheduled_date: Time.new(2026, 7, 22,  9, 0, 0) },
  { patient_name: "Beatriz Lima",    patient_email: "beatriz.lima@example.com",    nutritionist_service: nutritionist_services[2], scheduled_date: Time.new(2026, 7, 24, 15, 0, 0) },

  # Carlos Santos (nutritionist 2) — service 2
  { patient_name: "Hugo Cardoso",    patient_email: "hugo.cardoso@example.com",    nutritionist_service: nutritionist_services[3], scheduled_date: Time.new(2026, 7, 22, 10, 0, 0) },
  { patient_name: "Leonor Pinto",    patient_email: "leonor.pinto@example.com",    nutritionist_service: nutritionist_services[3], scheduled_date: Time.new(2026, 7, 25, 11, 0, 0) },

  # Ana Costa (nutritionist 3) — services 3, 4 and 5
  { patient_name: "Vera Rodrigues",  patient_email: "vera.rodrigues@example.com",  nutritionist_service: nutritionist_services[4], scheduled_date: Time.new(2026, 7, 21, 16, 0, 0) },
  { patient_name: "Nelson Moreira",  patient_email: "nelson.moreira@example.com",  nutritionist_service: nutritionist_services[4], scheduled_date: Time.new(2026, 7, 23, 14, 0, 0) },
  { patient_name: "Joana Teixeira",  patient_email: "joana.teixeira@example.com",  nutritionist_service: nutritionist_services[5], scheduled_date: Time.new(2026, 7, 22, 17, 0, 0) },
  { patient_name: "Ricardo Branco",  patient_email: "ricardo.branco@example.com",  nutritionist_service: nutritionist_services[5], scheduled_date: Time.new(2026, 7, 24, 10, 0, 0) },
  { patient_name: "Mariana Castro",  patient_email: "mariana.castro@example.com",  nutritionist_service: nutritionist_services[6], scheduled_date: Time.new(2026, 7, 23,  9, 0, 0) },
  { patient_name: "Diogo Ferreira",  patient_email: "diogo.ferreira@example.com",  nutritionist_service: nutritionist_services[6], scheduled_date: Time.new(2026, 7, 25, 15, 0, 0) },
  { patient_name: "Sónia Pereira",   patient_email: "sonia.pereira@example.com",   nutritionist_service: nutritionist_services[6], scheduled_date: Time.new(2026, 7, 26, 11, 0, 0) }
]

appointments = appointment_data.map do |attrs|
  Appointment.find_or_create_by!(
    patient_email: attrs[:patient_email],
    scheduled_date: attrs[:scheduled_date]
  ) do |a|
    a.assign_attributes(attrs.merge(status: :pending))
  end
end

puts "Seeded #{appointments.count} appointments"
