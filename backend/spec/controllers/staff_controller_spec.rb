require 'rails_helper'

RSpec.describe StaffController, type: :controller do
  let(:user) { create(:user) }
  let(:valid_attributes) {
    {
      name: '山田太郎',
      email: 'yamada@example.com',
      phone: '090-1234-5678',
      role: 'ケアマネージャー',
      department: '介護支援課',
      hire_date: '2020-04-01'
    }
  }

  let(:invalid_attributes) {
    { name: nil }
  }

  before do
    sign_in user
  end

  describe "GET #index" do
    it "全てのスタッフを返す" do
      staff1 = Staff.create!(valid_attributes)
      staff2 = Staff.create!(valid_attributes.merge(name: '佐藤花子', email: 'sato@example.com'))
      get :index
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end

    it "検索パラメータでフィルタリングできる" do
      staff1 = Staff.create!(valid_attributes)
      staff2 = Staff.create!(valid_attributes.merge(name: '佐藤花子', email: 'sato@example.com'))
      get :index, params: { search: '山田' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['name']).to eq('山田太郎')
    end

    it "部署でフィルタリングできる" do
      staff1 = Staff.create!(valid_attributes)
      staff2 = Staff.create!(valid_attributes.merge(department: '訪問介護課', email: 'sato@example.com'))
      get :index, params: { department: '介護支援課' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['department']).to eq('介護支援課')
    end

    it "アクティブステータスでフィルタリングできる" do
      staff1 = Staff.create!(valid_attributes)
      staff2 = Staff.create!(valid_attributes.merge(is_active: false, email: 'sato@example.com'))
      get :index, params: { is_active: true }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['is_active']).to be true
    end
  end

  describe "GET #show" do
    it "指定されたスタッフを返す" do
      staff = Staff.create!(valid_attributes)
      get :show, params: { id: staff.id }
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json['name']).to eq('山田太郎')
    end

    it "存在しないIDの場合404を返す" do
      get :show, params: { id: 9999 }
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST #create" do
    context "有効なパラメータの場合" do
      it "新しいスタッフを作成する" do
        expect {
          post :create, params: { staff: valid_attributes }
        }.to change(Staff, :count).by(1)
        expect(response).to have_http_status(:created)
      end

      it "作成されたスタッフを返す" do
        post :create, params: { staff: valid_attributes }
        json = JSON.parse(response.body)
        expect(json['name']).to eq('山田太郎')
      end
    end

    context "無効なパラメータの場合" do
      it "新しいスタッフを作成しない" do
        expect {
          post :create, params: { staff: invalid_attributes }
        }.to_not change(Staff, :count)
      end

      it "エラーを返す" do
        post :create, params: { staff: invalid_attributes }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end
  end

  describe "PATCH #update" do
    let(:staff) { Staff.create!(valid_attributes) }

    context "有効なパラメータの場合" do
      let(:new_attributes) { { role: 'シニアケアマネージャー' } }

      it "スタッフを更新する" do
        patch :update, params: { id: staff.id, staff: new_attributes }
        staff.reload
        expect(staff.role).to eq('シニアケアマネージャー')
      end

      it "更新されたスタッフを返す" do
        patch :update, params: { id: staff.id, staff: new_attributes }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['role']).to eq('シニアケアマネージャー')
      end
    end

    context "無効なパラメータの場合" do
      it "エラーを返す" do
        patch :update, params: { id: staff.id, staff: { name: nil } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "DELETE #destroy" do
    it "スタッフを削除する" do
      staff = Staff.create!(valid_attributes)
      expect {
        delete :destroy, params: { id: staff.id }
      }.to change(Staff, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end

  describe "認証" do
    context "ログインしていない場合" do
      before { sign_out user }

      it "401を返す" do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end