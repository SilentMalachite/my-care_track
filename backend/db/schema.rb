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

ActiveRecord::Schema[8.0].define(version: 2025_07_27_085457) do
  create_table "assessments", force: :cascade do |t|
    t.integer "client_id", null: false
    t.integer "staff_id", null: false
    t.integer "support_plan_id"
    t.string "assessment_type", null: false
    t.date "assessment_date", null: false
    t.text "summary"
    t.integer "overall_score"
    t.json "category_scores"
    t.text "strengths"
    t.text "challenges"
    t.text "recommendations"
    t.text "goals"
    t.string "status", default: "draft"
    t.datetime "finalized_at"
    t.integer "finalized_by"
    t.text "attachments"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assessment_date"], name: "index_assessments_on_assessment_date"
    t.index ["client_id", "assessment_date"], name: "index_assessments_on_client_id_and_assessment_date"
    t.index ["client_id"], name: "index_assessments_on_client_id"
    t.index ["staff_id"], name: "index_assessments_on_staff_id"
    t.index ["status"], name: "index_assessments_on_status"
    t.index ["support_plan_id"], name: "index_assessments_on_support_plan_id"
  end

  create_table "clients", force: :cascade do |t|
    t.string "client_number", null: false
    t.string "name", null: false
    t.string "name_kana"
    t.date "date_of_birth"
    t.string "gender"
    t.string "phone"
    t.string "email"
    t.text "address"
    t.string "disability_type"
    t.integer "disability_grade"
    t.string "insurance_number"
    t.string "status", default: "active"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_number"], name: "index_clients_on_client_number", unique: true
    t.index ["status"], name: "index_clients_on_status"
  end

  create_table "emergency_contacts", force: :cascade do |t|
    t.integer "client_id", null: false
    t.string "name", null: false
    t.string "relationship", null: false
    t.string "phone", null: false
    t.string "email"
    t.text "address"
    t.boolean "is_primary", default: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id", "is_primary"], name: "index_emergency_contacts_on_client_id_and_is_primary"
    t.index ["client_id"], name: "index_emergency_contacts_on_client_id"
  end

  create_table "password_histories", force: :cascade do |t|
    t.integer "staff_id", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["staff_id"], name: "index_password_histories_on_staff_id"
  end

  create_table "service_logs", force: :cascade do |t|
    t.integer "client_id", null: false
    t.integer "support_plan_id"
    t.integer "staff_id", null: false
    t.date "service_date", null: false
    t.time "start_time", null: false
    t.time "end_time", null: false
    t.string "service_type", null: false
    t.text "details"
    t.text "achievements"
    t.text "issues"
    t.text "next_actions"
    t.integer "mood_level"
    t.string "health_status"
    t.text "attachments"
    t.text "notes"
    t.string "status", default: "draft"
    t.integer "approved_by"
    t.datetime "approved_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["approved_by"], name: "index_service_logs_on_approved_by"
    t.index ["client_id", "service_date"], name: "index_service_logs_on_client_id_and_service_date"
    t.index ["client_id"], name: "index_service_logs_on_client_id"
    t.index ["service_date"], name: "index_service_logs_on_service_date"
    t.index ["staff_id"], name: "index_service_logs_on_staff_id"
    t.index ["status"], name: "index_service_logs_on_status"
    t.index ["support_plan_id"], name: "index_service_logs_on_support_plan_id"
  end

  create_table "staffs", force: :cascade do |t|
    t.string "staff_number", null: false
    t.string "name", null: false
    t.string "name_kana"
    t.string "email", null: false
    t.string "phone"
    t.string "role", default: "staff"
    t.text "specialties"
    t.string "status", default: "active"
    t.string "password_digest", null: false
    t.datetime "last_login_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "failed_login_attempts", default: 0, null: false
    t.datetime "locked_at"
    t.datetime "password_changed_at"
    t.index ["email"], name: "index_staffs_on_email", unique: true
    t.index ["staff_number"], name: "index_staffs_on_staff_number", unique: true
    t.index ["status"], name: "index_staffs_on_status"
  end

  create_table "support_plans", force: :cascade do |t|
    t.integer "client_id", null: false
    t.string "plan_name", null: false
    t.text "goals"
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.string "status", default: "pending"
    t.string "priority", default: "medium"
    t.text "assigned_staff_ids"
    t.text "notes"
    t.string "plan_number"
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id", "status"], name: "index_support_plans_on_client_id_and_status"
    t.index ["client_id"], name: "index_support_plans_on_client_id"
    t.index ["plan_number"], name: "index_support_plans_on_plan_number"
    t.index ["status"], name: "index_support_plans_on_status"
  end

  add_foreign_key "assessments", "clients"
  add_foreign_key "assessments", "staffs"
  add_foreign_key "assessments", "support_plans"
  add_foreign_key "emergency_contacts", "clients"
  add_foreign_key "password_histories", "staffs"
  add_foreign_key "service_logs", "clients"
  add_foreign_key "service_logs", "staffs"
  add_foreign_key "service_logs", "support_plans"
  add_foreign_key "support_plans", "clients"
end
