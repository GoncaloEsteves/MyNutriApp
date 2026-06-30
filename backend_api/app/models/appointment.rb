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

  def overlapping_pending_for_nutritionist
    nutritionist_id = nutritionist_service.nutritionist_id
    accepted_start = scheduled_date
    accepted_end = scheduled_date + nutritionist_service.service.duration.minutes

    Appointment
      .pending
      .joins(nutritionist_service: :service)
      .where(nutritionist_services: { nutritionist_id: nutritionist_id })
      .where.not(id: id)
      .where(
        "appointments.scheduled_date < ? AND appointments.scheduled_date + (services.duration * interval '1 minute') > ?",
        accepted_end, accepted_start
      )
  end
end
