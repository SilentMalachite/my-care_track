class Staff < ApplicationRecord
  has_secure_password

  # Security configuration delegates
  
  def self.password_config
    Rails.application.config.security[:password]
  end
  
  def self.login_config
    Rails.application.config.security[:login]
  end

  # Associations
  has_many :service_logs
  has_many :approved_logs, class_name: 'ServiceLog', foreign_key: 'approved_by'
  has_many :assessments
  has_many :password_histories, dependent: :destroy

  # Validations
  validates :staff_number, presence: true, uniqueness: true
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, inclusion: { in: %w[admin staff viewer] }
  validates :status, inclusion: { in: %w[active inactive] }
  
  # Password validations
  validate :password_complexity, if: :password_required?
  validate :password_not_in_history, if: :password_required?

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :by_role, ->(role) { where(role: role) }
  scope :locked, -> { where.not(locked_at: nil) }

  # Callbacks
  before_create :set_defaults
  after_update :save_password_history, if: :saved_change_to_password_digest?

  # Instance methods
  def admin?
    role == 'admin'
  end

  def can_approve?
    %w[admin staff].include?(role)
  end

  def active?
    status == 'active'
  end

  def specialties_array
    specialties&.split(',')&.map(&:strip) || []
  end

  def update_last_login!
    update_columns(
      last_login_at: Time.current,
      failed_login_attempts: 0
    )
  end

  # Security methods
  def increment_failed_login_attempts!
    increment!(:failed_login_attempts)
    lock_account! if failed_login_attempts >= self.class.login_config[:max_attempts]
  end

  def reset_failed_login_attempts!
    update_column(:failed_login_attempts, 0)
  end

  def lock_account!
    update_column(:locked_at, Time.current)
  end

  def unlock_account!
    update_columns(
      locked_at: nil,
      failed_login_attempts: 0
    )
  end

  def locked?
    locked_at.present?
  end

  def can_login?
    !locked? && active?
  end

  def password_expired?
    return false if password_changed_at.nil?
    password_changed_at < self.class.password_config[:expiration_days].days.ago
  end

  def force_password_change?
    password_expired?
  end

  private

  def set_defaults
    self.status ||= 'active'
    self.role ||= 'staff'
    self.password_changed_at ||= Time.current
  end

  def password_required?
    new_record? || password.present?
  end

  def password_complexity
    return if password.blank?

    min_length = self.class.password_config[:min_length]
    if password.length < min_length
      errors.add(:password, "は#{min_length}文字以上で入力してください")
    end

    unless password.match?(/[A-Z]/)
      errors.add(:password, 'は大文字を1文字以上含む必要があります')
    end

    unless password.match?(/[a-z]/)
      errors.add(:password, 'は小文字を1文字以上含む必要があります')
    end

    unless password.match?(/\d/)
      errors.add(:password, 'は数字を1文字以上含む必要があります')
    end

    special_chars = self.class.password_config[:special_chars]
    unless password.match?(/[#{Regexp.escape(special_chars)}]/)
      errors.add(:password, 'は特殊文字を1文字以上含む必要があります')
    end
  end

  def password_not_in_history
    return if password.blank?

    history_limit = self.class.password_config[:history_limit]
    
    # Check current password
    if password_digest_was.present? && BCrypt::Password.new(password_digest_was) == password
      errors.add(:password, "は過去#{history_limit}回のパスワードと同じものは使用できません")
      return
    end
    
    # Check password history
    recent_passwords = password_histories.recent(history_limit)
    recent_passwords.each do |history|
      if BCrypt::Password.new(history.password_digest) == password
        errors.add(:password, "は過去#{history_limit}回のパスワードと同じものは使用できません")
        break
      end
    end
  end

  def save_password_history
    return unless saved_change_to_password_digest?
    
    # Save the old password digest before it was changed
    old_digest = saved_change_to_password_digest[0]
    if old_digest.present?
      password_histories.create!(password_digest: old_digest)
    end
    
    update_column(:password_changed_at, Time.current)
    
    # Clean up old password history
    history_limit = self.class.password_config[:history_limit]
    old_histories = password_histories.order(created_at: :desc).offset(history_limit)
    old_histories.destroy_all if old_histories.any?
  end
end