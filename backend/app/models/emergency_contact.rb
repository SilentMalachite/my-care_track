class EmergencyContact < ApplicationRecord
  belongs_to :client
  
  validates :name, presence: true
  validates :relationship, presence: true
  validates :phone, presence: true
  
  scope :primary, -> { where(is_primary: true) }
  
  before_save :ensure_single_primary
  
  private
  
  def ensure_single_primary
    if is_primary?
      client.emergency_contacts.where.not(id: id).update_all(is_primary: false)
    end
  end
end