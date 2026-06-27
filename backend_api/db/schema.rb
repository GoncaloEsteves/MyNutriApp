# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_27_200919) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "appointments", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "nutritionist_service_id", null: false
    t.string "patient_email"
    t.string "patient_name"
    t.datetime "scheduled_date"
    t.integer "status", default: 0
    t.datetime "updated_at", null: false
    t.index ["nutritionist_service_id"], name: "index_appointments_on_nutritionist_service_id"
  end

  create_table "locations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "latitude"
    t.string "longitude"
    t.string "name"
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_locations_on_name", unique: true
  end

  create_table "nutritionist_services", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "nutritionist_id", null: false
    t.bigint "service_id", null: false
    t.datetime "updated_at", null: false
    t.index ["nutritionist_id", "service_id"], name: "index_nutritionist_services_on_nutritionist_id_and_service_id", unique: true
    t.index ["nutritionist_id"], name: "index_nutritionist_services_on_nutritionist_id"
    t.index ["service_id"], name: "index_nutritionist_services_on_service_id"
  end

  create_table "nutritionists", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "service_types", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_service_types_on_name", unique: true
  end

  create_table "services", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.time "duration"
    t.bigint "location_id", null: false
    t.decimal "price"
    t.bigint "service_type_id", null: false
    t.datetime "updated_at", null: false
    t.index ["location_id"], name: "index_services_on_location_id"
    t.index ["service_type_id", "location_id"], name: "index_services_on_service_type_id_and_location_id", unique: true
    t.index ["service_type_id"], name: "index_services_on_service_type_id"
  end

  add_foreign_key "appointments", "nutritionist_services"
  add_foreign_key "nutritionist_services", "nutritionists"
  add_foreign_key "nutritionist_services", "services"
  add_foreign_key "services", "locations"
  add_foreign_key "services", "service_types"
end
