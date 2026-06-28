class NutritionistBlueprint < Blueprinter::Base
  fields :id, :name

  association :services, blueprint: ServiceBlueprint
end