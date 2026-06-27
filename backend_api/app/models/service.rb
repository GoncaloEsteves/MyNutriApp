class Service < ApplicationRecord
  belongs_to :service_type
  belongs_to :location

  has_many :nutritionist_services
  has_many :nutritionists, through: :nutritionist_services
end
