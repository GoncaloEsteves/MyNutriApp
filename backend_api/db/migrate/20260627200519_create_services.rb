class CreateServices < ActiveRecord::Migration[8.1]
  def change
    create_table :services do |t|
      t.decimal :price
      t.time :duration
      t.belongs_to :service_type, null: false, foreign_key: true
      t.belongs_to :location, null: false, foreign_key: true

      t.timestamps
    end

    add_index :services, [ :service_type_id, :location_id ], unique: true
  end
end
