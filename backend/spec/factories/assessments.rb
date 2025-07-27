FactoryBot.define do
  factory :assessment do
    association :client
    association :staff
    assessment_type { Assessment::ASSESSMENT_TYPES.sample }
    assessment_date { Date.today }
    summary { "クライアントの現在の状態と今後の支援方針について評価しました。" }
    overall_score { rand(60..90) }
    category_scores { { "身体機能" => rand(60..90), "認知機能" => rand(60..90), "社会参加" => rand(60..90) } }
    strengths { "日常生活動作は概ね自立している。意欲的に活動に参加している。" }
    challenges { "階段昇降時に不安定さが見られる。服薬管理に支援が必要。" }
    recommendations { "理学療法の頻度を週2回に増やす。服薬カレンダーの導入を検討。" }
    goals { "3ヶ月後には階段を安全に昇降できるようになる。服薬の自己管理ができるようになる。" }
    status { 'draft' }
    notes { "次回評価は3ヶ月後に実施予定" }
  end
end