class Client < ApplicationRecord
  # Associations
  has_many :support_plans, dependent: :restrict_with_error
  has_many :service_logs, dependent: :restrict_with_error
  has_many :emergency_contacts, dependent: :destroy
  has_many :assessments, dependent: :restrict_with_error

  # Validations
  validates :client_number, presence: true, uniqueness: true
  validates :name, presence: true
  validates :gender, inclusion: { in: %w[male female other] }, allow_blank: true
  validates :status, inclusion: { in: %w[active inactive suspended] }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :disability_grade, numericality: { 
    greater_than_or_equal_to: 1, 
    less_than_or_equal_to: 6 
  }, allow_blank: true

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :by_status, ->(status) { where(status: status) }
  scope :search_by_name, ->(query) { 
    where("name LIKE :query OR name_kana LIKE :query", query: "%#{query}%") 
  }

  # Callbacks
  before_create :set_defaults

  # Instance methods
  def age
    return nil unless date_of_birth
    ((Date.today - date_of_birth.to_date) / 365.25).floor
  end

  def full_address
    return address unless respond_to?(:address_detail) && address_detail.present?
    "#{address} #{address_detail}"
  end

  def active?
    status == 'active'
  end

  # Class methods
  def self.search(params)
    clients = all
    clients = clients.search_by_name(params[:name]) if params[:name].present?
    clients = clients.by_status(params[:status]) if params[:status].present?
    clients
  end

  private

  def set_defaults
    self.status ||= 'active'
  end
end