require 'rails_helper'

RSpec.describe Api::V1::AuthController, type: :controller do
  describe 'POST #login' do
    let(:staff) { create(:staff, email: 'test@example.com', password: 'Password123!') }

    context 'with valid credentials' do
      it 'returns success and authentication token' do
        post :login, params: { email: staff.email, password: 'Password123!' }
        
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['token']).to be_present
        expect(json['staff']['email']).to eq(staff.email)
      end

      it 'updates last login timestamp' do
        expect {
          post :login, params: { email: staff.email, password: 'Password123!' }
        }.to change { staff.reload.last_login_at }
      end

      it 'resets failed login attempts' do
        staff.update(failed_login_attempts: 3)
        
        post :login, params: { email: staff.email, password: 'Password123!' }
        
        expect(staff.reload.failed_login_attempts).to eq(0)
      end
    end

    context 'with invalid credentials' do
      it 'returns unauthorized for wrong password' do
        post :login, params: { email: staff.email, password: 'WrongPassword123!' }
        
        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('メールアドレスまたはパスワードが正しくありません')
      end

      it 'increments failed login attempts' do
        expect {
          post :login, params: { email: staff.email, password: 'WrongPassword123!' }
        }.to change { staff.reload.failed_login_attempts }.by(1)
      end

      it 'locks account after 5 failed attempts' do
        5.times do
          post :login, params: { email: staff.email, password: 'WrongPassword123!' }
        end
        
        expect(staff.reload).to be_locked
      end
    end

    context 'with locked account' do
      before { staff.lock_account! }

      it 'returns unauthorized even with correct password' do
        post :login, params: { email: staff.email, password: 'Password123!' }
        
        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('アカウントがロックされています')
      end
    end

    context 'with inactive account' do
      before do
        staff # Force creation
        staff.update_column(:status, 'inactive')
      end

      it 'returns unauthorized' do
        post :login, params: { email: staff.email, password: 'Password123!' }
        
        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('アカウントが無効です')
      end
    end

    context 'with expired password' do
      before do
        staff # Force creation
        staff.update_column(:password_changed_at, 91.days.ago)
      end

      it 'returns password change required' do
        post :login, params: { email: staff.email, password: 'Password123!' }
        
        expect(response).to have_http_status(:forbidden)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('パスワードの有効期限が切れています')
        expect(json['password_expired']).to be_truthy
      end
    end
  end

  describe 'POST #change_password' do
    let(:staff) { create(:staff, password: 'OldPassword123!') }
    let(:token) { generate_auth_token(staff) }

    before do
      request.headers['Authorization'] = "Bearer #{token}"
    end

    context 'with valid parameters' do
      it 'changes password successfully' do
        post :change_password, params: {
          current_password: 'OldPassword123!',
          new_password: 'NewPassword123!',
          new_password_confirmation: 'NewPassword123!'
        }
        
        expect(response).to have_http_status(:ok)
        expect(staff.reload.authenticate('NewPassword123!')).to be_truthy
      end

      it 'saves password to history' do
        expect {
          post :change_password, params: {
            current_password: 'OldPassword123!',
            new_password: 'NewPassword123!',
            new_password_confirmation: 'NewPassword123!'
          }
        }.to change { staff.password_histories.count }.by(1)
      end
    end

    context 'with invalid parameters' do
      it 'returns error for wrong current password' do
        post :change_password, params: {
          current_password: 'WrongPassword123!',
          new_password: 'NewPassword123!',
          new_password_confirmation: 'NewPassword123!'
        }
        
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('現在のパスワードが正しくありません')
      end

      it 'returns error for password mismatch' do
        post :change_password, params: {
          current_password: 'OldPassword123!',
          new_password: 'NewPassword123!',
          new_password_confirmation: 'DifferentPassword123!'
        }
        
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('新しいパスワードが一致しません')
      end

      it 'returns error for weak password' do
        post :change_password, params: {
          current_password: 'OldPassword123!',
          new_password: 'weak',
          new_password_confirmation: 'weak'
        }
        
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']['password']).to include('は8文字以上で入力してください')
      end

      it 'returns error for reusing old password' do
        post :change_password, params: {
          current_password: 'OldPassword123!',
          new_password: 'OldPassword123!',
          new_password_confirmation: 'OldPassword123!'
        }
        
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']['password']).to include('は過去5回のパスワードと同じものは使用できません')
      end
    end
  end

  describe 'POST #logout' do
    let(:staff) { create(:staff) }
    let(:token) { generate_auth_token(staff) }

    before do
      request.headers['Authorization'] = "Bearer #{token}"
    end

    it 'logs out successfully' do
      post :logout
      
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['message']).to eq('ログアウトしました')
    end
  end
end