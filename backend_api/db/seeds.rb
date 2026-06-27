# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

nutritionists = [
  Nutritionist.find_or_create_by({ name: 'João Silva' }),
  Nutritionist.find_or_create_by({ name: 'Maria Oliveira' }),
  Nutritionist.find_or_create_by({ name: 'Carlos Santos' }),
  Nutritionist.find_or_create_by({ name: 'Ana Costa' })
]

locations = [
  Location.find_or_create_by({ name: 'Braga', latitude: 41.5454, longitude: -8.4265 }),
  Location.find_or_create_by({ name: 'Porto', latitude: 41.1496, longitude: -8.6109 }),
  Location.find_or_create_by({ name: 'Lisboa', latitude: 38.7169, longitude: -9.1396 })
]

service_types = [
  ServiceType.find_or_create_by({ name: 'Consulta em domicílio' }),
  ServiceType.find_or_create_by({ name: 'Consulta em clínica' }),
  ServiceType.find_or_create_by({ name: 'Consulta online' })
]

services = [
  Service.find_or_create_by({ location: locations[0], service_type: service_types[0], price: 70.0, duration: Time.parse("01:00") }),
  Service.find_or_create_by({ location: locations[0], service_type: service_types[1], price: 50.0, duration: Time.parse("00:45") }),
  Service.find_or_create_by({ location: locations[1], service_type: service_types[1], price: 60.0, duration: Time.parse("01:00") }),
  Service.find_or_create_by({ location: locations[0], service_type: service_types[2], price: 30.0, duration: Time.parse("00:30") }),
  Service.find_or_create_by({ location: locations[1], service_type: service_types[2], price: 30.0, duration: Time.parse("00:30") }),
  Service.find_or_create_by({ location: locations[2], service_type: service_types[2], price: 30.0, duration: Time.parse("00:30") })
]

nutritionist_services = [
  NutritionistService.find_or_create_by({ nutritionist: nutritionists[0], service: services[0] }),
  NutritionistService.find_or_create_by({ nutritionist: nutritionists[0], service: services[1] }),
  NutritionistService.find_or_create_by({ nutritionist: nutritionists[1], service: services[1] }),
  NutritionistService.find_or_create_by({ nutritionist: nutritionists[2], service: services[2] }),
  NutritionistService.find_or_create_by({ nutritionist: nutritionists[3], service: services[3] }),
  NutritionistService.find_or_create_by({ nutritionist: nutritionists[3], service: services[4] }),
  NutritionistService.find_or_create_by({ nutritionist: nutritionists[3], service: services[5] })
]

pendingStatus = Appointment.statuses[:pending]

appointments = [
  Appointment.find_or_create_by(
    {
      patient_name: 'Pedro Almeida',
      patient_email: 'pedro.almeida@example.com',
      nutritionist_service: nutritionist_services[0],
      scheduled_date: Time.new(2026, 7, 15, 10, 0, 0),
      status: pendingStatus
    }),
  Appointment.find_or_create_by(
    {
      patient_name: 'Sofia Martins',
      patient_email: 'sofia.martins@example.com',
      nutritionist_service: nutritionist_services[1],
      scheduled_date: Time.new(2026, 7, 16, 10, 0, 0),
      status: pendingStatus
    }),
  Appointment.find_or_create_by(
    {
      patient_name: 'Rui Costa',
      patient_email: 'rui.costa@example.com',
      nutritionist_service: nutritionist_services[2],
      scheduled_date: Time.new(2026, 7, 17, 10, 0, 0),
      status: pendingStatus
    }),
  Appointment.find_or_create_by(
    {
      patient_name: 'Inês Ferreira',
      patient_email: 'ines.ferreira@example.com',
      nutritionist_service: nutritionist_services[3],
      scheduled_date: Time.new(2026, 7, 18, 10, 0, 0),
      status: pendingStatus
    }),
  Appointment.find_or_create_by(
    {
      patient_name: 'Tiago Lopes',
      patient_email: 'tiago.lopes@example.com',
      nutritionist_service: nutritionist_services[4],
      scheduled_date: Time.new(2026, 7, 19, 10, 0, 0),
      status: pendingStatus
    }),
  Appointment.find_or_create_by(
    {
      patient_name: 'Carla Ribeiro',
      patient_email: 'carla.ribeiro@example.com',
      nutritionist_service: nutritionist_services[5],
      scheduled_date: Time.new(2026, 7, 20, 10, 0, 0),
      status: pendingStatus
  })
]
