class NutritionistService < ApplicationRecord
  belongs_to :nutritionist
  belongs_to :service

  has_many :appointments
end
