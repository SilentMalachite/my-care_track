require 'rails_helper'

RSpec.describe Api::V1::SupportPlansController, type: :controller do
  let(:client) { create(:client) }
  let(:staff) { create(:staff) }

  before do
    request.headers.merge!(auth_headers(staff))
  end
  
  let(:valid_attributes) {
    {
      client_id: client.id,
      plan_name: '自立支援計画',
      goals: '日常生活の自立を目指す',
      start_date: Date.today,
      end_date: Date.today + 6.months,
      status: 'active',
      priority: 'high',
      plan_number: 'SP001'
    }
  }

  let(:invalid_attributes) {
    {
      client_id: nil,
      plan_name: nil,
      start_date: nil,
      end_date: nil
    }
  }

  let(:support_plan) { SupportPlan.create! valid_attributes }

  describe "GET #index" do
    it "returns a success response" do
      support_plan
      get :index
      expect(response).to be_successful
      expect(response.content_type).to eq('application/json; charset=utf-8')
    end

    it "returns all support plans" do
      plan1 = SupportPlan.create! valid_attributes
      plan2 = SupportPlan.create! valid_attributes.merge(
        plan_number: 'SP002', 
        plan_name: '職業支援計画',
        start_date: Date.today + 7.months,
        end_date: Date.today + 13.months
      )
      
      get :index
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end

    it "filters by client_id" do
      client2 = Client.create!(client_number: 'CL002', name: '佐藤花子', status: 'active')
      plan1 = SupportPlan.create! valid_attributes
      plan2 = SupportPlan.create! valid_attributes.merge(
        client_id: client2.id,
        plan_number: 'SP002'
      )
      
      get :index, params: { client_id: client.id }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['client_id']).to eq(client.id)
    end

    it "filters by status" do
      active_plan = SupportPlan.create! valid_attributes
      completed_plan = SupportPlan.create! valid_attributes.merge(
        plan_number: 'SP002',
        status: 'completed',
        start_date: Date.today + 7.months,
        end_date: Date.today + 13.months
      )
      
      get :index, params: { status: 'active' }
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json[0]['status']).to eq('active')
    end

    it "paginates results" do
      5.times do |i|
        SupportPlan.create! valid_attributes.merge(
          plan_number: "SP#{i.to_s.rjust(3, '0')}",
          plan_name: "計画#{i}",
          start_date: Date.today + (i * 7).months,
          end_date: Date.today + (i * 7 + 6).months
        )
      end
      
      get :index, params: { page: 1, limit: 3 }
      json = JSON.parse(response.body)
      expect(json['data'].length).to eq(3)
      expect(json['pagination']['total']).to eq(5)
    end
  end

  describe "GET #show" do
    it "returns a success response" do
      get :show, params: { id: support_plan.id }
      expect(response).to be_successful
    end

    it "returns the requested support plan" do
      get :show, params: { id: support_plan.id }
      json = JSON.parse(response.body)
      expect(json['id']).to eq(support_plan.id)
      expect(json['plan_name']).to eq(support_plan.plan_name)
    end

    it "returns not found for non-existent support plan" do
      get :show, params: { id: 999999 }
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST #create" do
    context "with valid params" do
      it "creates a new SupportPlan" do
        expect {
          post :create, params: { support_plan: valid_attributes }
        }.to change(SupportPlan, :count).by(1)
      end

      it "returns a created response" do
        post :create, params: { support_plan: valid_attributes }
        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['plan_name']).to eq('自立支援計画')
      end
    end

    context "with invalid params" do
      it "does not create a new SupportPlan" do
        expect {
          post :create, params: { support_plan: invalid_attributes }
        }.to change(SupportPlan, :count).by(0)
      end

      it "returns an unprocessable entity response" do
        post :create, params: { support_plan: invalid_attributes }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end
  end

  describe "PUT #update" do
    context "with valid params" do
      let(:new_attributes) {
        { plan_name: '更新された計画', goals: '新しい目標' }
      }

      it "updates the requested support plan" do
        put :update, params: { id: support_plan.id, support_plan: new_attributes }
        support_plan.reload
        expect(support_plan.plan_name).to eq('更新された計画')
        expect(support_plan.goals).to eq('新しい目標')
      end

      it "returns a success response" do
        put :update, params: { id: support_plan.id, support_plan: new_attributes }
        expect(response).to be_successful
      end
    end

    context "with invalid params" do
      it "returns an unprocessable entity response" do
        put :update, params: { id: support_plan.id, support_plan: { plan_name: nil } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when support plan not found" do
      it "returns not found" do
        put :update, params: { id: 999999, support_plan: { plan_name: 'test' } }
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "DELETE #destroy" do
    it "destroys the requested support plan" do
      support_plan
      expect {
        delete :destroy, params: { id: support_plan.id }
      }.to change(SupportPlan, :count).by(-1)
    end

    it "returns a no content response" do
      delete :destroy, params: { id: support_plan.id }
      expect(response).to have_http_status(:no_content)
    end

    context "when support plan has associated service logs" do
      let(:service_log) {
        ServiceLog.create!(
          client: client,
          support_plan: support_plan,
          staff: staff,
          service_date: Date.today,
          start_time: '09:00',
          end_time: '10:00',
          service_type: 'support'
        )
      }

      it "does not destroy the support plan" do
        service_log
        expect {
          delete :destroy, params: { id: support_plan.id }
        }.to change(SupportPlan, :count).by(0)
      end

      it "returns an unprocessable entity response" do
        service_log
        delete :destroy, params: { id: support_plan.id }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to include('Cannot delete support plan with associated records')
      end
    end
  end

  describe "GET #statistics" do
    before do
      SupportPlan.create! valid_attributes
      SupportPlan.create! valid_attributes.merge(
        plan_number: 'SP002', 
        status: 'completed',
        start_date: Date.today + 7.months,
        end_date: Date.today + 13.months
      )
      SupportPlan.create! valid_attributes.merge(
        plan_number: 'SP003', 
        status: 'pending',
        start_date: Date.today + 14.months,
        end_date: Date.today + 20.months
      )
    end

    it "returns support plan statistics" do
      get :statistics
      json = JSON.parse(response.body)
      
      expect(json['total']).to eq(3)
      expect(json['by_status']['active']).to eq(1)
      expect(json['by_status']['completed']).to eq(1)
      expect(json['by_status']['pending']).to eq(1)
    end
  end

  describe "POST #complete" do
    it "marks the support plan as completed" do
      post :complete, params: { id: support_plan.id }
      support_plan.reload
      expect(support_plan.status).to eq('completed')
      expect(support_plan.completed_at).to be_present
    end

    it "returns the updated support plan" do
      post :complete, params: { id: support_plan.id }
      json = JSON.parse(response.body)
      expect(json['status']).to eq('completed')
      expect(json['completed_at']).to be_present
    end
  end
end