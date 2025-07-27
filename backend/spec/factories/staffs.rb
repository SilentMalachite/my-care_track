FactoryBot.define do
  factory :staff do
    sequence(:staff_number) { |n| "ST#{n.to_s.rjust(6, '0')}" }
    name { "鈴木花子" }
    name_kana { "スズキハナコ" }
    sequence(:email) { |n| "staff#{n}@example.com" }
    phone { "090-9876-5432" }
    role { "staff" }
    specialties { "身体介護,生活支援" }
    status { "active" }
    password { "Password123!" }
    last_login_at { nil }
  end
end
