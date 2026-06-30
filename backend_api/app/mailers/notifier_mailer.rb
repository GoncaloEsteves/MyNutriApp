class NotifierMailer < ApplicationMailer
  def appointment_accepted(recipient)
    mail(
      to: recipient,
      subject: "MyNutriApp Appointment Accepted"
    )
  end

  def appointment_rejected(recipient)
    mail(
      to: recipient,
      subject: "MyNutriApp Appointment Rejected"
    )
  end
end
