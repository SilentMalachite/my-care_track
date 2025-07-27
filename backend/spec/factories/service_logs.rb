FactoryBot.define do
  factory :service_log do
    client { nil }
    support_plan { nil }
    staff { nil }
    service_date { "2025-07-27" }
    start_time { "2025-07-27 15:59:47" }
    end_time { "2025-07-27 15:59:47" }
    service_type { "MyString" }
    details { "MyText" }
    achievements { "MyText" }
    issues { "MyText" }
    next_actions { "MyText" }
    mood_level { 1 }
    health_status { "MyString" }
    attachments { "MyText" }
    notes { "MyText" }
    status { "MyString" }
    approved_by { 1 }
    approved_at { "2025-07-27 15:59:47" }
  end
end
