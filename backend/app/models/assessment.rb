class Assessment < ApplicationRecord
  belongs_to :client
  belongs_to :staff
  belongs_to :support_plan, optional: true

  validates :assessment_type, presence: true
  validates :assessment_date, presence: true
  validates :summary, presence: true, if: -> { status == 'approved' }
  validates :overall_score, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: 100 }, allow_nil: true
  validates :status, inclusion: { in: %w[draft pending approved] }

  scope :by_date, -> { order(assessment_date: :desc) }
  scope :recent, -> { where(assessment_date: 1.month.ago..Date.today) }
  scope :approved, -> { where(status: 'approved') }

  ASSESSMENT_TYPES = %w[initial periodic annual discharge].freeze

  def finalize!(staff)
    update!(
      status: 'approved',
      finalized_at: Time.current,
      finalized_by: staff.id
    )
  end

  def editable?
    status == 'draft'
  end
end