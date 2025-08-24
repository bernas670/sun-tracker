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

ActiveRecord::Schema[8.0].define(version: 2025_08_23_153346) do
  create_table "events", force: :cascade do |t|
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.date "date"
    t.integer "sunrise"
    t.integer "sunset"
    t.integer "first_light"
    t.integer "last_light"
    t.integer "dawn"
    t.integer "dusk"
    t.integer "solar_noon"
    t.integer "golden_hour"
    t.integer "day_length"
    t.integer "utc_offset"
    t.string "timezone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["latitude", "longitude", "date"], name: "index_events_on_latitude_and_longitude_and_date", unique: true
  end
end
