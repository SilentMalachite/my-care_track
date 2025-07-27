require 'rails_helper'

RSpec.describe Assessment, type: :model do
  describe 'associations' do
    it { should belong_to(:client) }
    it { should belong_to(:staff) }
    it { should belong_to(:support_plan).optional }
  end

  describe 'validations' do
    it { should validate_presence_of(:assessment_type) }
    it { should validate_presence_of(:assessment_date) }
    it { should validate_inclusion_of(:status).in_array(%w[draft pending approved]) }
    
    context 'when status is approved' do
      subject { build(:assessment, status: 'approved') }
      it { should validate_presence_of(:summary) }
    end

    context 'overall_score validation' do
      it { should validate_numericality_of(:overall_score).is_greater_than_or_equal_to(1).is_less_than_or_equal_to(100).allow_nil }
    end
  end

  describe 'scopes' do
    let!(:assessment_old) { create(:assessment, assessment_date: 2.months.ago) }
    let!(:assessment_recent) { create(:assessment, assessment_date: 1.week.ago) }
    let!(:assessment_today) { create(:assessment, assessment_date: Date.today) }
    let!(:assessment_approved) { create(:assessment, status: 'approved') }

    describe '.by_date' do
      it 'orders assessments by date descending' do
        ordered = Assessment.by_date
        dates = ordered.map(&:assessment_date)
        expect(dates).to eq(dates.sort.reverse)
      end
    end

    describe '.recent' do
      it 'returns assessments from the last month' do
        expect(Assessment.recent).to include(assessment_recent, assessment_today)
        expect(Assessment.recent).not_to include(assessment_old)
      end
    end

    describe '.approved' do
      it 'returns only approved assessments' do
        expect(Assessment.approved).to eq([assessment_approved])
      end
    end
  end

  describe 'constants' do
    it 'has assessment types' do
      expect(Assessment::ASSESSMENT_TYPES).to eq(%w[initial periodic annual discharge])
    end
  end

  describe '#finalize!' do
    let(:staff) { create(:staff) }
    let(:assessment) { create(:assessment, status: 'draft') }

    it 'updates status to approved' do
      assessment.finalize!(staff)
      expect(assessment.status).to eq('approved')
    end

    it 'sets finalized_at timestamp' do
      freeze_time do
        assessment.finalize!(staff)
        expect(assessment.finalized_at).to eq(Time.current)
      end
    end

    it 'sets finalized_by to staff id' do
      assessment.finalize!(staff)
      expect(assessment.finalized_by).to eq(staff.id)
    end
  end

  describe '#editable?' do
    context 'when status is draft' do
      let(:assessment) { build(:assessment, status: 'draft') }
      it 'returns true' do
        expect(assessment.editable?).to be true
      end
    end

    context 'when status is not draft' do
      let(:assessment) { build(:assessment, status: 'approved') }
      it 'returns false' do
        expect(assessment.editable?).to be false
      end
    end
  end
end