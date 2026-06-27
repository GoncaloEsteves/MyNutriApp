class CreateAppointments < ActiveRecord::Migration[8.1]
  def change
    create_table :appointments do |t|
      t.string :patient_name
      t.string :patient_email
      t.datetime :scheduled_date
      t.integer :status, default: 0
      t.belongs_to :nutritionist_service, null: false, foreign_key: true

      t.timestamps
    end
  end
end
