# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "開始: データベースシード..."

# 管理者スタッフの作成
admin_staff = Staff.find_or_create_by!(staff_number: 'ADM001') do |staff|
  staff.name = '管理者'
  staff.name_kana = 'カンリシャ'
  staff.email = 'admin@care-track.jp'
  staff.role = 'admin'
  staff.status = 'active'
  staff.password = 'password123'
  staff.specialties = '管理, 相談支援'
end

# 一般スタッフの作成
staff_data = [
  {
    staff_number: 'ST001',
    name: '田中花子',
    name_kana: 'タナカハナコ',
    email: 'tanaka@care-track.jp',
    role: 'staff',
    specialties: '身体介護, 生活支援'
  },
  {
    staff_number: 'ST002',
    name: '佐藤太郎',
    name_kana: 'サトウタロウ',
    email: 'sato@care-track.jp',
    role: 'staff',
    specialties: '精神保健, 就労支援'
  },
  {
    staff_number: 'ST003',
    name: '鈴木美香',
    name_kana: 'スズキミカ',
    email: 'suzuki@care-track.jp',
    role: 'staff',
    specialties: '相談支援, 計画相談'
  }
]

staff_records = []
staff_data.each do |data|
  staff = Staff.find_or_create_by!(staff_number: data[:staff_number]) do |s|
    s.name = data[:name]
    s.name_kana = data[:name_kana]
    s.email = data[:email]
    s.role = data[:role]
    s.status = 'active'
    s.password = 'password123'
    s.specialties = data[:specialties]
  end
  staff_records << staff
end

# クライアントの作成
client_data = [
  {
    client_number: 'CL001',
    name: '山田太郎',
    name_kana: 'ヤマダタロウ',
    date_of_birth: '1990-05-15',
    gender: 'male',
    phone: '03-1234-5678',
    email: 'yamada.taro@example.com',
    address: '東京都千代田区丸の内1-1-1',
    disability_type: 'physical',
    disability_grade: 2,
    insurance_number: 'INS001234',
    status: 'active',
    notes: '車椅子利用。日常生活介護が必要。'
  },
  {
    client_number: 'CL002',
    name: '山田花子',
    name_kana: 'ヤマダハナコ',
    date_of_birth: '1985-08-22',
    gender: 'female',
    phone: '03-2345-6789',
    email: 'yamada.hanako@example.com',
    address: '東京都新宿区西新宿2-2-2',
    disability_type: 'intellectual',
    disability_grade: 3,
    insurance_number: 'INS002345',
    status: 'active',
    notes: '知的障害。就労支援が必要。'
  },
  {
    client_number: 'CL003',
    name: '田中次郎',
    name_kana: 'タナカジロウ',
    date_of_birth: '1988-12-10',
    gender: 'male',
    phone: '03-3456-7890',
    email: 'tanaka.jiro@example.com',
    address: '東京都渋谷区渋谷3-3-3',
    disability_type: 'mental',
    disability_grade: 2,
    insurance_number: 'INS003456',
    status: 'active',
    notes: '精神障害。服薬管理と社会復帰支援が必要。'
  }
]

client_records = []
client_data.each do |data|
  client = Client.find_or_create_by!(client_number: data[:client_number]) do |c|
    c.name = data[:name]
    c.name_kana = data[:name_kana]
    c.date_of_birth = Date.parse(data[:date_of_birth])
    c.gender = data[:gender]
    c.phone = data[:phone]
    c.email = data[:email]
    c.address = data[:address]
    c.disability_type = data[:disability_type]
    c.disability_grade = data[:disability_grade]
    c.insurance_number = data[:insurance_number]
    c.status = data[:status]
    c.notes = data[:notes]
  end
  client_records << client
end

# 緊急連絡先の作成
emergency_contacts_data = [
  {
    client: client_records[0],
    name: '山田一郎',
    relationship: '父',
    phone: '03-1111-2222',
    email: 'yamada.ichiro@example.com',
    address: '東京都千代田区丸の内1-1-1',
    is_primary: true,
    notes: '主たる介護者'
  },
  {
    client: client_records[1],
    name: '山田三郎',
    relationship: '兄',
    phone: '03-3333-4444',
    email: 'yamada.saburo@example.com',
    address: '東京都新宿区西新宿2-2-2',
    is_primary: true,
    notes: '後見人'
  }
]

emergency_contacts_data.each do |data|
  EmergencyContact.find_or_create_by!(
    client: data[:client],
    name: data[:name],
    relationship: data[:relationship]
  ) do |ec|
    ec.phone = data[:phone]
    ec.email = data[:email]
    ec.address = data[:address]
    ec.is_primary = data[:is_primary]
    ec.notes = data[:notes]
  end
end

# 支援計画の作成
support_plans_data = [
  {
    client: client_records[0],
    plan_name: '身体介護・生活支援計画',
    goals: '日常生活の自立と社会参加の促進',
    start_date: Date.current - 1.month,
    end_date: Date.current + 5.months,
    status: 'active',
    priority: 'high',
    assigned_staff_ids: [staff_records[0].id, staff_records[2].id].to_json,
    notes: '車椅子での移動介助と日常生活支援を中心とした計画'
  },
  {
    client: client_records[1],
    plan_name: '就労移行支援計画',
    goals: '一般就労への移行を目指した支援',
    start_date: Date.current - 2.weeks,
    end_date: Date.current + 10.months,
    status: 'active',
    priority: 'medium',
    assigned_staff_ids: [staff_records[1].id].to_json,
    notes: '職業訓練と就労定着支援を中心とした計画'
  },
  {
    client: client_records[2],
    plan_name: '精神保健・社会復帰支援計画',
    goals: '精神的安定と段階的な社会復帰',
    start_date: Date.current - 3.days,
    end_date: Date.current + 8.months,
    status: 'active',
    priority: 'high',
    assigned_staff_ids: [staff_records[1].id, staff_records[2].id].to_json,
    notes: '服薬管理と社会復帰に向けた段階的支援'
  }
]

support_plan_records = []
support_plans_data.each do |data|
  # 重複する期間を避けるために既存の計画をチェック
  existing_plan = SupportPlan.where(
    client: data[:client],
    status: %w[pending active]
  ).where(
    '(start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?)',
    data[:end_date], data[:start_date], data[:start_date], data[:end_date]
  ).first

  unless existing_plan
    plan = SupportPlan.create!(data)
    support_plan_records << plan
  end
end

# サービスログの作成（過去1週間分）
service_types = %w[physical_support domestic_support counseling recreation_activity medical_support]

if support_plan_records.any?
  7.times do |days_ago|
    service_date = Date.current - days_ago.days
    
    # 各クライアントに対してサービスログを作成
    client_records.each_with_index do |client, index|
      next unless support_plan_records[index]
      
      # 1日に1-2回のサービス
      (1..2).each do |service_num|
        start_hour = 9 + (service_num - 1) * 3
        start_time = "#{start_hour.to_s.rjust(2, '0')}:00"
        end_time = "#{(start_hour + 2).to_s.rjust(2, '0')}:00"
        
        # 時間の重複をチェック
        existing_log = ServiceLog.where(
          client: client,
          service_date: service_date,
          start_time: start_time
        ).first
        
        next if existing_log
        
        ServiceLog.create!(
          client: client,
          support_plan: support_plan_records[index],
          staff: staff_records.sample,
          service_date: service_date,
          start_time: start_time,
          end_time: end_time,
          service_type: service_types.sample,
          details: "#{service_date}のサービス提供記録",
          achievements: "計画通りにサービスを実施",
          mood_level: [3, 4, 5].sample,
          health_status: %w[excellent good fair].sample,
          status: days_ago > 3 ? 'approved' : 'draft',
          approved_by: days_ago > 3 ? admin_staff.id : nil,
          approved_at: days_ago > 3 ? (service_date + 1.day) : nil,
          notes: "#{client.name}様への支援記録"
        )
      end
    end
  end
end

puts "完了: データベースシード"
puts "作成されたデータ:"
puts "- スタッフ: #{Staff.count}人"
puts "- クライアント: #{Client.count}人"
puts "- 緊急連絡先: #{EmergencyContact.count}件"
puts "- 支援計画: #{SupportPlan.count}件"
puts "- サービスログ: #{ServiceLog.count}件"
