class AddSecurityFieldsToStaffs < ActiveRecord::Migration[8.0]
  def change
    add_column :staffs, :failed_login_attempts, :integer, default: 0, null: false
    add_column :staffs, :locked_at, :datetime
    add_column :staffs, :password_changed_at, :datetime

    # Create password history table
    create_table :password_histories do |t|
      t.references :staff, null: false, foreign_key: true
      t.string :password_digest, null: false
      t.timestamps
    end

    # Set password_changed_at for existing records
    reversible do |dir|
      dir.up do
        Staff.update_all(password_changed_at: Time.current)
      end
    end
  end
end