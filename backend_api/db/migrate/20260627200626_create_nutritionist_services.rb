class CreateNutritionistServices < ActiveRecord::Migration[8.1]
  def change
    create_table :nutritionist_services do |t|
      t.belongs_to :nutritionist, null: false, foreign_key: true
      t.belongs_to :service, null: false, foreign_key: true

      t.timestamps
    end

    add_index :nutritionist_services, [ :nutritionist_id, :service_id ], unique: true
  end
end
