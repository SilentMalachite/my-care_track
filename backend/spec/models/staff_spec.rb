require 'rails_helper'

RSpec.describe Staff, type: :model do
  describe 'validations' do
    subject { build(:staff) }

    it { should validate_presence_of(:staff_number) }
    it { should validate_uniqueness_of(:staff_number) }
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email) }
    it { should allow_value('test@example.com').for(:email) }
    it { should_not allow_value('invalid_email').for(:email) }
    it { should validate_inclusion_of(:role).in_array(%w[admin staff viewer]) }
    it { should validate_inclusion_of(:status).in_array(%w[active inactive]) }
  end

  describe 'associations' do
    it { should have_many(:service_logs) }
    it { should have_many(:approved_logs).class_name('ServiceLog').with_foreign_key('approved_by') }
    it { should have_many(:assessments) }
  end

  describe 'password security' do
    describe 'password complexity' do
      it 'requires a minimum length of 8 characters' do
        staff = build(:staff, password: 'Pass1!')
        expect(staff).not_to be_valid
        expect(staff.errors[:password]).to include('は8文字以上で入力してください')
      end

      it 'requires at least one uppercase letter' do
        staff = build(:staff, password: 'password123!')
        expect(staff).not_to be_valid
        expect(staff.errors[:password]).to include('は大文字を1文字以上含む必要があります')
      end

      it 'requires at least one lowercase letter' do
        staff = build(:staff, password: 'PASSWORD123!')
        expect(staff).not_to be_valid
        expect(staff.errors[:password]).to include('は小文字を1文字以上含む必要があります')
      end

      it 'requires at least one digit' do
        staff = build(:staff, password: 'Password!')
        expect(staff).not_to be_valid
        expect(staff.errors[:password]).to include('は数字を1文字以上含む必要があります')
      end

      it 'requires at least one special character' do
        staff = build(:staff, password: 'Password123')
        expect(staff).not_to be_valid
        expect(staff.errors[:password]).to include('は特殊文字を1文字以上含む必要があります')
      end

      it 'accepts a valid complex password' do
        staff = build(:staff, password: 'Password123!')
        expect(staff).to be_valid
      end
    end

    describe 'password encryption' do
      it 'encrypts password using bcrypt' do
        staff = create(:staff, password: 'Password123!')
        expect(staff.password_digest).not_to eq('Password123!')
        expect(staff.password_digest).to match(/^\$2[ayb]\$\d{2}\$.{53}$/)
      end

      it 'authenticates with correct password' do
        staff = create(:staff, password: 'Password123!')
        expect(staff.authenticate('Password123!')).to eq(staff)
      end

      it 'does not authenticate with incorrect password' do
        staff = create(:staff, password: 'Password123!')
        expect(staff.authenticate('WrongPassword123!')).to be_falsey
      end
    end

    describe 'login attempts' do
      it 'tracks failed login attempts' do
        staff = create(:staff)
        expect(staff.failed_login_attempts).to eq(0)
        
        staff.increment_failed_login_attempts!
        expect(staff.reload.failed_login_attempts).to eq(1)
      end

      it 'locks account after 5 failed attempts' do
        staff = create(:staff)
        5.times { staff.increment_failed_login_attempts! }
        
        expect(staff.reload).to be_locked
        expect(staff.locked_at).not_to be_nil
      end

      it 'resets failed attempts on successful login' do
        staff = create(:staff, failed_login_attempts: 3)
        staff.reset_failed_login_attempts!
        
        expect(staff.reload.failed_login_attempts).to eq(0)
      end

      it 'prevents login when account is locked' do
        staff = create(:staff, locked_at: 1.hour.ago)
        expect(staff.can_login?).to be_falsey
      end
    end

    describe 'password expiration' do
      it 'requires password change after 90 days' do
        staff = create(:staff, password_changed_at: 91.days.ago)
        expect(staff.password_expired?).to be_truthy
      end

      it 'does not require password change within 90 days' do
        staff = create(:staff, password_changed_at: 89.days.ago)
        expect(staff.password_expired?).to be_falsey
      end
    end

    describe 'password history' do
      it 'prevents reusing the last 5 passwords' do
        staff = create(:staff, password: 'Password123!')
        old_password = 'Password123!'
        
        staff.update(password: 'NewPassword123!')
        expect(staff.update(password: old_password)).to be_falsey
        expect(staff.errors[:password]).to include('は過去5回のパスワードと同じものは使用できません')
      end
    end
  end

  describe 'scopes' do
    let!(:active_staff) { create(:staff, status: 'active') }
    let!(:inactive_staff) { create(:staff, status: 'inactive') }
    let!(:admin_staff) { create(:staff, role: 'admin') }
    let!(:viewer_staff) { create(:staff, role: 'viewer') }

    describe '.active' do
      it 'returns only active staff' do
        expect(Staff.active).to include(active_staff)
        expect(Staff.active).not_to include(inactive_staff)
      end
    end

    describe '.by_role' do
      it 'returns staff with specified role' do
        expect(Staff.by_role('admin')).to include(admin_staff)
        expect(Staff.by_role('admin')).not_to include(viewer_staff)
      end
    end
  end

  describe 'instance methods' do
    let(:staff) { create(:staff) }

    describe '#admin?' do
      it 'returns true for admin role' do
        staff.role = 'admin'
        expect(staff.admin?).to be_truthy
      end

      it 'returns false for non-admin role' do
        staff.role = 'staff'
        expect(staff.admin?).to be_falsey
      end
    end

    describe '#can_approve?' do
      it 'returns true for admin and staff roles' do
        staff.role = 'admin'
        expect(staff.can_approve?).to be_truthy
        
        staff.role = 'staff'
        expect(staff.can_approve?).to be_truthy
      end

      it 'returns false for viewer role' do
        staff.role = 'viewer'
        expect(staff.can_approve?).to be_falsey
      end
    end

    describe '#update_last_login!' do
      it 'updates last_login_at timestamp' do
        freeze_time do
          staff.update_last_login!
          expect(staff.reload.last_login_at).to eq(Time.current)
        end
      end
    end
  end
end