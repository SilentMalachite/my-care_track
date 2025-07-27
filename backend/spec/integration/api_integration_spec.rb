require 'rails_helper'

RSpec.describe 'API Integration', type: :request do
  let!(:admin_staff) { create(:staff, role: 'admin') }
  let!(:staff) { create(:staff) }
  let!(:client) { create(:client) }

  def auth_headers_for(user)
    { 'Authorization' => "Bearer #{generate_auth_token(user)}" }
  end

  describe 'Clients API' do
    it 'handles complete CRUD operations' do
      # Create
      post '/api/v1/clients', params: {
        client: {
          client_number: 'CL999',
          name: '新規クライアント',
          status: 'active'
        }
      }, headers: auth_headers_for(staff)
      expect(response).to have_http_status(:created)
      created_client = JSON.parse(response.body)

      # Read (Index)
      get '/api/v1/clients', headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      clients = JSON.parse(response.body)
      expect(clients.length).to be >= 2

      # Read (Show)
      get "/api/v1/clients/#{created_client['id']}", headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      client_data = JSON.parse(response.body)
      expect(client_data['name']).to eq('新規クライアント')

      # Update
      put "/api/v1/clients/#{created_client['id']}", params: {
        client: { name: '更新されたクライアント' }
      }, headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      updated_client = JSON.parse(response.body)
      expect(updated_client['name']).to eq('更新されたクライアント')

      # Delete
      delete "/api/v1/clients/#{created_client['id']}", headers: auth_headers_for(staff)
      expect(response).to have_http_status(:no_content)
    end

    it 'provides search and statistics' do
      # Search
      get '/api/v1/clients/search', params: { q: '山田' }, headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      results = JSON.parse(response.body)
      expect(results.length).to be >= 1

      # Statistics
      get '/api/v1/clients/statistics', headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      stats = JSON.parse(response.body)
      expect(stats).to have_key('total')
      expect(stats).to have_key('by_status')
    end
  end

  describe 'Support Plans API' do
    let!(:support_plan) {
      SupportPlan.create!(
        client: client,
        plan_name: 'テスト計画',
        start_date: Date.current,
        end_date: Date.current + 6.months,
        status: 'active'
      )
    }

    it 'handles complete CRUD operations' do
      # Create
      post '/api/v1/support_plans', params: {
        support_plan: {
          client_id: client.id,
          plan_name: '新規支援計画',
          start_date: Date.current + 7.months,
          end_date: Date.current + 13.months,
          status: 'pending'
        }
      }, headers: auth_headers_for(staff)
      expect(response).to have_http_status(:created)

      # Read (Index)
      get '/api/v1/support_plans', headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      plans = JSON.parse(response.body)
      expect(plans.length).to be >= 2

      # Show
      get "/api/v1/support_plans/#{support_plan.id}", headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      plan_data = JSON.parse(response.body)
      expect(plan_data['plan_name']).to eq('テスト計画')

      # Complete action
      post "/api/v1/support_plans/#{support_plan.id}/complete", headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      completed_plan = JSON.parse(response.body)
      expect(completed_plan['status']).to eq('completed')
    end
  end

  describe 'Service Logs API' do
    let!(:support_plan) {
      SupportPlan.create!(
        client: client,
        plan_name: 'サービスログテスト計画',
        start_date: Date.current,
        end_date: Date.current + 6.months,
        status: 'active'
      )
    }

    it 'handles complete CRUD operations' do
      # Create
      post '/api/v1/service_logs', params: {
        service_log: {
          client_id: client.id,
          support_plan_id: support_plan.id,
          staff_id: staff.id,
          service_date: Date.current,
          start_time: '09:00',
          end_time: '11:00',
          service_type: 'physical_support',
          details: 'テストサービス',
          status: 'draft'
        }
      }, headers: auth_headers_for(staff)
      expect(response).to have_http_status(:created)
      created_log = JSON.parse(response.body)

      # Read (Index)
      get '/api/v1/service_logs', headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      logs = JSON.parse(response.body)
      expect(logs.length).to be >= 1

      # Show
      get "/api/v1/service_logs/#{created_log['id']}", headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)

      # Approve
      post "/api/v1/service_logs/#{created_log['id']}/approve", params: {
        approved_by: admin_staff.id
      }, headers: auth_headers_for(admin_staff)
      expect(response).to have_http_status(:ok)
      approved_log = JSON.parse(response.body)
      expect(approved_log['status']).to eq('approved')
    end

    it 'provides filtering and statistics' do
      # Create a service log for testing
      ServiceLog.create!(
        client: client,
        support_plan: support_plan,
        staff: staff,
        service_date: Date.current,
        start_time: '09:00',
        end_time: '11:00',
        service_type: 'counseling',
        details: 'フィルターテスト',
        status: 'draft'
      )

      # Filter by client_id
      get '/api/v1/service_logs', params: { client_id: client.id }, headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      filtered_logs = JSON.parse(response.body)
      expect(filtered_logs.length).to be >= 1

      # Statistics
      get '/api/v1/service_logs/statistics', headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      stats = JSON.parse(response.body)
      expect(stats).to have_key('total')
      expect(stats).to have_key('by_status')
      expect(stats).to have_key('by_service_type')
    end
  end

  describe 'Cross-model relationships' do
    it 'maintains data integrity' do
      # Create related records
      plan = SupportPlan.create!(
        client: client,
        plan_name: '関連性テスト計画',
        start_date: Date.current,
        end_date: Date.current + 6.months,
        status: 'active'
      )

      log = ServiceLog.create!(
        client: client,
        support_plan: plan,
        staff: staff,
        service_date: Date.current,
        start_time: '09:00',
        end_time: '11:00',
        service_type: 'physical_support',
        status: 'approved',
        approved_by: admin_staff.id,
        approved_at: Time.current
      )

      # Try to delete support plan with associated service log
      delete "/api/v1/support_plans/#{plan.id}", headers: auth_headers_for(staff)
      expect(response).to have_http_status(:unprocessable_entity)
      error_data = JSON.parse(response.body)
      expect(error_data['error']).to include('Cannot delete support plan with associated records')

      # Try to delete approved service log
      delete "/api/v1/service_logs/#{log.id}", headers: auth_headers_for(staff)
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end