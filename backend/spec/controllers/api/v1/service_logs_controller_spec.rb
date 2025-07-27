require 'rails_helper'

RSpec.describe Api::V1::ServiceLogsController, type: :controller do
  let(:client) { create(:client) }
  let(:staff) { create(:staff) }

  before do
    request.headers.merge!(auth_headers(staff))
  end
  let(:support_plan) { SupportPlan.create!(client: client, plan_name: '自立支援計画', start_date: Date.today, end_date: Date.today + 6.months, status: 'active') }
  
  let(:valid_attributes) {
    {
      client_id: client.id,
      support_plan_id: support_plan.id,
      staff_id: staff.id,
      service_date: Date.today,
      start_time: '09:00',
      end_time: '10:00',
      service_type: 'physical_support',
      details: '歩行訓練を実施',
      achievements: '10分間歩行継続',
      mood_level: 4,
      health_status: 'good',
      status: 'draft'
    }
  }

  let(:invalid_attributes) {
    {
      client_id: nil,
      staff_id: nil,
      service_date: nil,
      start_time: nil,
      end_time: nil,
      service_type: nil
    }
  }

  let(:service_log) { ServiceLog.create! valid_attributes }

  describe "GET #index" do
    it "returns a success response" do
      service_log
      get :index
      expect(response).to be_successful
      expect(response.content_type).to eq('application/json; charset=utf-8')
    end

    it "returns all service logs" do
      log1 = ServiceLog.create! valid_attributes
      log2 = ServiceLog.create! valid_attributes.merge(
        service_type: 'domestic_support',
        start_time: '11:00',
        end_time: '12:00'
      )
      
      get :index
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end

    it "filters by client_id" do
      client2 = Client.create!(client_number: 'CL002', name: '佐藤花子', status: 'active')
      log1 = ServiceLog.create! valid_attributes
      log2 = ServiceLog.create! valid_attributes.merge(client_id: client2.id)
      
      get :index, params: { client_id: client.id }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['client_id']).to eq(client.id)
    end

    it "filters by staff_id" do
      staff2 = create(:staff)
      log1 = ServiceLog.create! valid_attributes
      log2 = ServiceLog.create! valid_attributes.merge(
        staff_id: staff2.id,
        start_time: '11:00',
        end_time: '12:00'
      )
      
      get :index, params: { staff_id: staff.id }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['staff_id']).to eq(staff.id)
    end

    it "filters by date range" do
      log1 = ServiceLog.create! valid_attributes.merge(service_date: Date.today - 2.days)
      log2 = ServiceLog.create! valid_attributes.merge(service_date: Date.today)
      log3 = ServiceLog.create! valid_attributes.merge(service_date: Date.today + 2.days)
      
      get :index, params: { 
        start_date: (Date.today - 1.day).to_s,
        end_date: (Date.today + 1.day).to_s
      }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['service_date']).to eq(Date.today.to_s)
    end

    it "filters by service_type" do
      log1 = ServiceLog.create! valid_attributes.merge(service_type: 'physical_support')
      log2 = ServiceLog.create! valid_attributes.merge(
        service_type: 'domestic_support',
        start_time: '11:00',
        end_time: '12:00'
      )
      
      get :index, params: { service_type: 'physical_support' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['service_type']).to eq('physical_support')
    end

    it "filters by status" do
      draft_log = ServiceLog.create! valid_attributes.merge(status: 'draft')
      approved_log = ServiceLog.create! valid_attributes.merge(
        status: 'approved',
        approved_by: staff.id,
        approved_at: Time.current,
        start_time: '11:00',
        end_time: '12:00'
      )
      
      get :index, params: { status: 'draft' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['status']).to eq('draft')
    end

    it "paginates results" do
      10.times do |i|
        ServiceLog.create! valid_attributes.merge(
          service_date: Date.today - i.days
        )
      end
      
      get :index, params: { page: 1, limit: 5 }
      json = JSON.parse(response.body)
      expect(json['data'].length).to eq(5)
      expect(json['pagination']['total']).to eq(10)
    end
  end

  describe "GET #show" do
    it "returns a success response" do
      get :show, params: { id: service_log.id }
      expect(response).to be_successful
    end

    it "returns the requested service log" do
      get :show, params: { id: service_log.id }
      json = JSON.parse(response.body)
      expect(json['id']).to eq(service_log.id)
      expect(json['service_type']).to eq(service_log.service_type)
    end

    it "returns not found for non-existent service log" do
      get :show, params: { id: 999999 }
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST #create" do
    context "with valid params" do
      it "creates a new ServiceLog" do
        expect {
          post :create, params: { service_log: valid_attributes }
        }.to change(ServiceLog, :count).by(1)
      end

      it "returns a created response" do
        post :create, params: { service_log: valid_attributes }
        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['service_type']).to eq('physical_support')
      end
    end

    context "with invalid params" do
      it "does not create a new ServiceLog" do
        expect {
          post :create, params: { service_log: invalid_attributes }
        }.to change(ServiceLog, :count).by(0)
      end

      it "returns an unprocessable entity response" do
        post :create, params: { service_log: invalid_attributes }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end
  end

  describe "PUT #update" do
    context "with valid params" do
      let(:new_attributes) {
        { details: '更新された詳細', achievements: '新しい成果' }
      }

      it "updates the requested service log" do
        put :update, params: { id: service_log.id, service_log: new_attributes }
        service_log.reload
        expect(service_log.details).to eq('更新された詳細')
        expect(service_log.achievements).to eq('新しい成果')
      end

      it "returns a success response" do
        put :update, params: { id: service_log.id, service_log: new_attributes }
        expect(response).to be_successful
      end
    end

    context "with invalid params" do
      it "returns an unprocessable entity response" do
        put :update, params: { id: service_log.id, service_log: { service_type: nil } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when service log not found" do
      it "returns not found" do
        put :update, params: { id: 999999, service_log: { details: 'test' } }
        expect(response).to have_http_status(:not_found)
      end
    end

    context "when service log is already approved" do
      it "returns unprocessable entity" do
        service_log.update!(status: 'approved', approved_by: staff.id, approved_at: Time.current)
        put :update, params: { id: service_log.id, service_log: { details: 'test' } }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to include('Cannot update approved service log')
      end
    end
  end

  describe "DELETE #destroy" do
    it "destroys the requested service log" do
      service_log
      expect {
        delete :destroy, params: { id: service_log.id }
      }.to change(ServiceLog, :count).by(-1)
    end

    it "returns a no content response" do
      delete :destroy, params: { id: service_log.id }
      expect(response).to have_http_status(:no_content)
    end

    context "when service log is approved" do
      it "does not destroy the service log" do
        service_log.update!(status: 'approved', approved_by: staff.id, approved_at: Time.current)
        expect {
          delete :destroy, params: { id: service_log.id }
        }.to change(ServiceLog, :count).by(0)
      end

      it "returns an unprocessable entity response" do
        service_log.update!(status: 'approved', approved_by: staff.id, approved_at: Time.current)
        delete :destroy, params: { id: service_log.id }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to include('Cannot delete approved service log')
      end
    end
  end

  describe "POST #approve" do
    let(:approver) { create(:staff, role: 'admin') }

    it "approves the service log" do
      post :approve, params: { id: service_log.id, approved_by: approver.id }
      service_log.reload
      expect(service_log.status).to eq('approved')
      expect(service_log.approved_by).to eq(approver.id)
      expect(service_log.approved_at).to be_present
    end

    it "returns the updated service log" do
      post :approve, params: { id: service_log.id, approved_by: approver.id }
      json = JSON.parse(response.body)
      expect(json['status']).to eq('approved')
      expect(json['approved_by']).to eq(approver.id)
    end

    context "when service log is already approved" do
      it "returns an error" do
        service_log.update!(status: 'approved', approved_by: staff.id, approved_at: Time.current)
        post :approve, params: { id: service_log.id, approved_by: approver.id }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to include('Service log is already approved')
      end
    end
  end

  describe "GET #statistics" do
    before do
      ServiceLog.create! valid_attributes.merge(
        service_type: 'physical_support',
        status: 'approved'
      )
      ServiceLog.create! valid_attributes.merge(
        service_type: 'domestic_support',
        status: 'draft',
        start_time: '11:00',
        end_time: '12:00'
      )
      ServiceLog.create! valid_attributes.merge(
        service_type: 'physical_support',
        status: 'draft',
        start_time: '13:00',
        end_time: '14:00'
      )
    end

    it "returns service log statistics" do
      get :statistics
      json = JSON.parse(response.body)
      
      expect(json['total']).to eq(3)
      expect(json['by_status']['approved']).to eq(1)
      expect(json['by_status']['draft']).to eq(2)
      expect(json['by_service_type']['physical_support']).to eq(2)
      expect(json['by_service_type']['domestic_support']).to eq(1)
    end

    it "filters statistics by date range" do
      get :statistics, params: {
        start_date: Date.today.to_s,
        end_date: Date.today.to_s
      }
      json = JSON.parse(response.body)
      expect(json['total']).to eq(3)
    end
  end
end