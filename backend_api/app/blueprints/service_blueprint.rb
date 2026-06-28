class ServiceBlueprint < Blueprinter::Base
  fields :id, :price, :duration

  field :service_type_name do |service|
    service.service_type.name
  end

  field :location_name do |service|
    service.location.name
  end
end