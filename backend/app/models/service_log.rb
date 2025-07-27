class ServiceLog < ApplicationRecord
  # Associations
  belongs_to :client
  belongs_to :support_plan, optional: true
  belongs_to :staff
  belongs_to :approved_by_staff, class_name: 'Staff', foreign_key: 'approved_by', optional: true

  # Validations
  validates :service_date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :service_type, presence: true
  validates :status, inclusion: { in: %w[draft confirmed approved] }
  validates :mood_level, numericality: { in: 1..5 }, allow_blank: true
  validates :health_status, inclusion: { in: %w[excellent good fair poor] }, allow_blank: true
  validate :end_time_after_start_time
  validate :service_duration_within_limit
  validate :no_time_overlap

  # Scopes
  scope :by_date, ->(date) { where(service_date: date) }
  scope :by_date_range, ->(start_date, end_date) { where(service_date: start_date..end_date) }
  scope :by_status, ->(status) { where(status: status) }
  scope :approved, -> { where(status: 'approved') }
  scope :pending_approval, -> { where(status: 'confirmed') }

  # Callbacks
  before_create :set_defaults
  before_update :set_approved_at
  before_destroy :prevent_approved_deletion

  # Instance methods
  def duration_minutes
    return 0 unless start_time && end_time
    ((end_time - start_time) / 60).to_i
  end

  def duration_hours
    duration_minutes / 60.0
  end

  def formatted_duration
    hours = duration_minutes / 60
    minutes = duration_minutes % 60
    "#{hours}時間#{minutes}分"
  end

  def approved?
    status == 'approved'
  end

  def can_edit?
    status != 'approved'
  end

  def achievements_array
    JSON.parse(achievements || '[]')
  rescue JSON::ParserError
    []
  end

  def issues_array
    JSON.parse(issues || '[]')
  rescue JSON::ParserError
    []
  end

  def next_actions_array
    JSON.parse(next_actions || '[]')
  rescue JSON::ParserError
    []
  end

  # Class methods
  def self.total_duration_for_period(client_id:, start_date:, end_date:)
    by_date_range(start_date, end_date)
      .where(client_id: client_id, status: 'approved')
      .sum { |log| log.duration_hours }
  end

  def self.summary_by_service_type(client_id:, start_date:, end_date:)
    logs = by_date_range(start_date, end_date)
      .where(client_id: client_id, status: 'approved')
    
    summary = {}
    logs.group_by(&:service_type).each do |type, type_logs|
      summary[type] = {
        count: type_logs.count,
        total_hours: type_logs.sum(&:duration_hours)
      }
    end
    summary
  end

  private

  def end_time_after_start_time
    return unless start_time && end_time
    errors.add(:end_time, 'must be after start time') if end_time <= start_time
  end

  def service_duration_within_limit
    return unless start_time && end_time
    if duration_hours > 8
      errors.add(:base, 'Service duration cannot exceed 8 hours')
    end
  end

  def no_time_overlap
    return unless client && service_date && start_time && end_time
    
    overlapping = self.class
      .where.not(id: id)
      .where(client: client, service_date: service_date)
      .where('(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?)',
             end_time, start_time, start_time, end_time)
    
    errors.add(:base, 'Service time overlaps with existing log') if overlapping.exists?
  end

  def set_defaults
    self.status ||= 'draft'
  end

  def set_approved_at
    if status_changed? && status == 'approved' && approved_at.nil?
      self.approved_at = Time.current
    end
  end

  def prevent_approved_deletion
    if approved?
      errors.add(:base, 'Cannot delete approved service log')
      throw :abort
    end
  end
end