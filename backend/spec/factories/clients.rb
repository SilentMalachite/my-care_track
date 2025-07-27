FactoryBot.define do
  factory :client do
    sequence(:client_number) { |n| "CL#{n.to_s.rjust(6, '0')}" }
    name { "山田太郎" }
    name_kana { "ヤマダタロウ" }
    date_of_birth { 30.years.ago }
    gender { "male" }
    phone { "090-1234-5678" }
    email { "yamada@example.com" }
    address { "東京都新宿区1-2-3" }
    disability_type { "身体障害" }
    disability_grade { 2 }
    insurance_number { "1234567890" }
    status { "active" }
    notes { "特記事項なし" }
  end
end
