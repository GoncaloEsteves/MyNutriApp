class Appointment < ApplicationRecord
  enum :status, { pending: 0, accepted: 1, rejected: 2 }

  belongs_to :nutritionist_service

  validates :patient_name, :patient_email, :scheduled_date, presence: true

  def accept!
    update(status: :accepted)
  end

  def reject!
    update(status: :rejected)
  end
end
