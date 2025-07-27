FactoryBot.define do
  factory :support_plan do
    client { nil }
    plan_name { "MyString" }
    goals { "MyText" }
    start_date { "2025-07-27" }
    end_date { "2025-07-27" }
    status { "MyString" }
    priority { "MyString" }
    assigned_staff_ids { "MyText" }
    notes { "MyText" }
    plan_number { "MyString" }
    completed_at { "2025-07-27 15:58:19" }
  end
end
