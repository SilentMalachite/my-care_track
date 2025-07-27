class SupportPlan < ApplicationRecord
  # Associations
  belongs_to :client
  has_many :service_logs, dependent: :restrict_with_error

  # Validations
  validates :plan_name, presence: true
  validates :start_date, presence: true
  validates :end_date, presence: true
  validates :status, inclusion: { in: %w[pending active completed cancelled] }
  validates :priority, inclusion: { in: %w[high medium low] }
  validate :end_date_after_start_date
  validate :no_overlapping_active_plans

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :current, -> { active.where('start_date <= ? AND end_date >= ?', Date.today, Date.today) }
  scope :upcoming, -> { where(status: 'pending').where('start_date > ?', Date.today) }
  scope :expiring_soon, ->(days) { 
    active.where('end_date BETWEEN ? AND ?', Date.today, Date.today + days.days) 
  }

  # Callbacks
  before_create :generate_plan_number
  before_update :set_completed_at

  # Instance methods
  def duration_days
    (end_date - start_date).to_i + 1
  end

  def remaining_days
    return 0 if end_date < Date.today
    (end_date - Date.today).to_i + 1
  end

  def progress_percentage
    return 0 if start_date > Date.today
    return 100 if end_date < Date.today
    
    total_days = duration_days
    elapsed_days = (Date.today - start_date).to_i + 1
    ((elapsed_days.to_f / total_days) * 100).round
  end

  def expired?
    end_date < Date.today
  end

  def active?
    status == 'active'
  end

  def goals_array
    JSON.parse(goals || '[]')
  rescue JSON::ParserError
    []
  end

  def assigned_staff_ids_array
    JSON.parse(assigned_staff_ids || '[]')
  rescue JSON::ParserError
    []
  end

  # Class methods
  def self.create_from_template(client:, template:, start_date:, end_date:)
    create!(
      client: client,
      plan_name: template[:plan_name],
      goals: template[:goals].to_json,
      start_date: start_date,
      end_date: end_date,
      priority: template[:priority] || 'medium',
      status: 'pending'
    )
  end

  private

  def end_date_after_start_date
    return unless start_date && end_date
    errors.add(:end_date, 'must be after start date') if end_date <= start_date
  end

  def no_overlapping_active_plans
    return unless client && start_date && end_date
    
    overlapping = client.support_plans
      .where.not(id: id)
      .where(status: %w[pending active])
      .where('(start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?)',
             end_date, start_date, start_date, end_date)
    
    errors.add(:base, 'Period overlaps with existing plan') if overlapping.exists?
  end

  def generate_plan_number
    self.plan_number = "SP#{Time.current.strftime('%Y%m%d%H%M%S')}".first(8)
  end

  def set_completed_at
    if status_changed? && status == 'completed' && completed_at.nil?
      self.completed_at = Time.current
    end
  end
end