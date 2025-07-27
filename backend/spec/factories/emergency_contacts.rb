FactoryBot.define do
  factory :emergency_contact do
    client { nil }
    name { "MyString" }
    relationship { "MyString" }
    phone { "MyString" }
    email { "MyString" }
    address { "MyText" }
    is_primary { false }
    notes { "MyText" }
  end
end
