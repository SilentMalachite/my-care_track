class PasswordHistory < ApplicationRecord
  belongs_to :staff
  
  validates :password_digest, presence: true
  
  scope :recent, ->(limit = 5) { order(created_at: :desc).limit(limit) }
end