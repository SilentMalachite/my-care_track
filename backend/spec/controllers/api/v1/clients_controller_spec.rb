require 'rails_helper'

RSpec.describe Api::V1::ClientsController, type: :controller do
  let(:staff) { create(:staff) }

  before do
    request.headers.merge!(auth_headers(staff))
  end

  let(:valid_attributes) {
    {
      client_number: 'CL001',
      name: '山田太郎',
      name_kana: 'ヤマダタロウ',
      date_of_birth: '1990-01-01',
      gender: 'male',
      phone: '03-1234-5678',
      email: 'yamada@example.com',
      address: '東京都千代田区1-1-1',
      disability_type: 'physical',
      disability_grade: 2,
      insurance_number: 'INS123456',
      status: 'active'
    }
  }

  let(:invalid_attributes) {
    {
      client_number: nil,
      name: nil
    }
  }

  let(:client) { Client.create! valid_attributes }

  describe "GET #index" do
    it "returns a success response" do
      client
      get :index
      expect(response).to be_successful
      expect(response.content_type).to eq('application/json; charset=utf-8')
    end

    it "returns all clients" do
      client1 = Client.create! valid_attributes
      client2 = Client.create! valid_attributes.merge(client_number: 'CL002', name: '佐藤花子')
      
      get :index
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end

    it "filters by status" do
      active_client = Client.create! valid_attributes
      inactive_client = Client.create! valid_attributes.merge(
        client_number: 'CL002',
        status: 'inactive'
      )
      
      get :index, params: { status: 'active' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['id']).to eq(active_client.id)
    end

    it "searches by name" do
      client1 = Client.create! valid_attributes
      client2 = Client.create! valid_attributes.merge(
        client_number: 'CL002',
        name: '佐藤花子',
        name_kana: 'サトウハナコ'
      )
      
      get :index, params: { search: '山田' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['name']).to eq('山田太郎')
    end

    it "paginates results" do
      10.times do |i|
        Client.create! valid_attributes.merge(
          client_number: "CL#{i.to_s.rjust(3, '0')}",
          name: "クライアント#{i}"
        )
      end
      
      get :index, params: { page: 1, limit: 5 }
      json = JSON.parse(response.body)
      expect(json['data'].length).to eq(5)
      expect(json['pagination']['total']).to eq(10)
      expect(json['pagination']['totalPages']).to eq(2)
    end
  end

  describe "GET #show" do
    it "returns a success response" do
      get :show, params: { id: client.id }
      expect(response).to be_successful
    end

    it "returns the requested client" do
      get :show, params: { id: client.id }
      json = JSON.parse(response.body)
      expect(json['id']).to eq(client.id)
      expect(json['name']).to eq(client.name)
    end

    it "returns not found for non-existent client" do
      get :show, params: { id: 999999 }
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST #create" do
    context "with valid params" do
      it "creates a new Client" do
        expect {
          post :create, params: { client: valid_attributes }
        }.to change(Client, :count).by(1)
      end

      it "returns a created response" do
        post :create, params: { client: valid_attributes }
        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['name']).to eq('山田太郎')
      end
    end

    context "with invalid params" do
      it "does not create a new Client" do
        expect {
          post :create, params: { client: invalid_attributes }
        }.to change(Client, :count).by(0)
      end

      it "returns an unprocessable entity response" do
        post :create, params: { client: invalid_attributes }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end

    context "with duplicate client_number" do
      it "returns an error" do
        Client.create! valid_attributes
        post :create, params: { client: valid_attributes }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']['client_number']).to include('has already been taken')
      end
    end
  end

  describe "PUT #update" do
    context "with valid params" do
      let(:new_attributes) {
        { name: '山田太郎（更新）', phone: '03-9999-9999' }
      }

      it "updates the requested client" do
        put :update, params: { id: client.id, client: new_attributes }
        client.reload
        expect(client.name).to eq('山田太郎（更新）')
        expect(client.phone).to eq('03-9999-9999')
      end

      it "returns a success response" do
        put :update, params: { id: client.id, client: new_attributes }
        expect(response).to be_successful
      end
    end

    context "with invalid params" do
      it "returns an unprocessable entity response" do
        put :update, params: { id: client.id, client: { name: nil } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when client not found" do
      it "returns not found" do
        put :update, params: { id: 999999, client: { name: 'test' } }
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE #destroy" do
    it "destroys the requested client" do
      client
      expect {
        delete :destroy, params: { id: client.id }
      }.to change(Client, :count).by(-1)
    end

    it "returns a no content response" do
      delete :destroy, params: { id: client.id }
      expect(response).to have_http_status(:no_content)
    end

    context "when client has associated records" do
      let(:support_plan) {
        SupportPlan.create!(
          client: client,
          plan_name: 'テスト計画',
          start_date: Date.today,
          end_date: Date.today + 6.months,
          status: 'active'
        )
      }

      it "does not destroy the client" do
        support_plan
        expect {
          delete :destroy, params: { id: client.id }
        }.to change(Client, :count).by(0)
      end

      it "returns an unprocessable entity response" do
        support_plan
        delete :destroy, params: { id: client.id }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to include('Cannot delete client with associated records')
      end
    end
  end

  describe "GET #search" do
    before do
      Client.create! valid_attributes
      Client.create! valid_attributes.merge(
        client_number: 'CL002',
        name: '佐藤花子',
        name_kana: 'サトウハナコ',
        phone: '03-9999-9999'
      )
    end

    it "searches by name" do
      get :search, params: { q: '山田' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['name']).to eq('山田太郎')
    end

    it "searches by kana" do
      get :search, params: { q: 'サトウ' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['name']).to eq('佐藤花子')
    end

    it "searches by client_number" do
      get :search, params: { q: 'CL002' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['client_number']).to eq('CL002')
    end

    it "searches by phone" do
      get :search, params: { q: '9999' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['phone']).to eq('03-9999-9999')
    end
  end

  describe "GET #statistics" do
    before do
      Client.create! valid_attributes
      Client.create! valid_attributes.merge(client_number: 'CL002', status: 'inactive')
      Client.create! valid_attributes.merge(client_number: 'CL003', status: 'suspended')
    end

    it "returns client statistics" do
      get :statistics
      json = JSON.parse(response.body)
      
      expect(json['total']).to eq(3)
      expect(json['by_status']['active']).to eq(1)
      expect(json['by_status']['inactive']).to eq(1)
      expect(json['by_status']['suspended']).to eq(1)
    end
  end

  describe "POST #check_client_number" do
    it "returns available: true for new client_number" do
      post :check_client_number, params: { client_number: 'CL999' }
      json = JSON.parse(response.body)
      expect(json['available']).to be true
    end

    it "returns available: false for existing client_number" do
      Client.create! valid_attributes
      post :check_client_number, params: { client_number: 'CL001' }
      json = JSON.parse(response.body)
      expect(json['available']).to be false
    end

    it "excludes current client when updating" do
      client = Client.create! valid_attributes
      post :check_client_number, params: { 
        client_number: 'CL001',
        exclude_id: client.id 
      }
      json = JSON.parse(response.body)
      expect(json['available']).to be true
    end
  end
end