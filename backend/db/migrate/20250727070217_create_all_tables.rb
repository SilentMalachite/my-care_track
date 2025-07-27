class CreateAllTables < ActiveRecord::Migration[8.0]
  def change
    # Clients table
    create_table :clients do |t|
      t.string :client_number, null: false
      t.string :name, null: false
      t.string :name_kana
      t.date :date_of_birth
      t.string :gender
      t.string :phone
      t.string :email
      t.text :address
      t.string :disability_type
      t.integer :disability_grade
      t.string :insurance_number
      t.string :status, default: 'active'
      t.text :notes
      
      t.timestamps
    end
    add_index :clients, :client_number, unique: true
    add_index :clients, :status

    # Staffs table
    create_table :staffs do |t|
      t.string :staff_number, null: false
      t.string :name, null: false
      t.string :name_kana
      t.string :email, null: false
      t.string :phone
      t.string :role, default: 'staff'
      t.text :specialties
      t.string :status, default: 'active'
      t.string :password_digest, null: false
      t.datetime :last_login_at
      
      t.timestamps
    end
    add_index :staffs, :staff_number, unique: true
    add_index :staffs, :email, unique: true
    add_index :staffs, :status

    # Support Plans table
    create_table :support_plans do |t|
      t.references :client, null: false, foreign_key: true
      t.string :plan_name, null: false
      t.text :goals
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.string :status, default: 'pending'
      t.string :priority, default: 'medium'
      t.text :assigned_staff_ids
      t.text :notes
      t.string :plan_number
      t.datetime :completed_at
      
      t.timestamps
    end
    add_index :support_plans, :status
    add_index :support_plans, :plan_number
    add_index :support_plans, [:client_id, :status]

    # Service Logs table
    create_table :service_logs do |t|
      t.references :client, null: false, foreign_key: true
      t.references :support_plan, foreign_key: true
      t.references :staff, null: false, foreign_key: true
      t.date :service_date, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.string :service_type, null: false
      t.text :details
      t.text :achievements
      t.text :issues
      t.text :next_actions
      t.integer :mood_level
      t.string :health_status
      t.text :attachments
      t.text :notes
      t.string :status, default: 'draft'
      t.integer :approved_by
      t.datetime :approved_at
      
      t.timestamps
    end
    add_index :service_logs, :service_date
    add_index :service_logs, :status
    add_index :service_logs, [:client_id, :service_date]
    add_index :service_logs, :approved_by

    # Emergency Contacts table
    create_table :emergency_contacts do |t|
      t.references :client, null: false, foreign_key: true
      t.string :name, null: false
      t.string :relationship, null: false
      t.string :phone, null: false
      t.string :email
      t.text :address
      t.boolean :is_primary, default: false
      t.text :notes
      
      t.timestamps
    end
    add_index :emergency_contacts, [:client_id, :is_primary]
  end
end