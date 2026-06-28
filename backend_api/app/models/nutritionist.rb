class Nutritionist < ApplicationRecord
  has_many :nutritionist_services
  has_many :services, through: :nutritionist_services
  
  validates :name, presence: true
end
