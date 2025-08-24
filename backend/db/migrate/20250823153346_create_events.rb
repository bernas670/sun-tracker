class CreateEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :events do |t|
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.date :date
      t.integer :sunrise
      t.integer :sunset
      t.integer :first_light
      t.integer :last_light
      t.integer :dawn
      t.integer :dusk
      t.integer :solar_noon
      t.integer :golden_hour
      t.integer :day_length
      t.integer :utc_offset
      t.string :timezone

      t.timestamps
    end

    add_index :events, [ :latitude, :longitude, :date ], unique: true
  end
end
