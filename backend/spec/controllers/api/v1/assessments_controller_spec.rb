require 'rails_helper'

RSpec.describe Api::V1::AssessmentsController, type: :controller do
  let(:client) { create(:client) }
  let(:staff) { create(:staff) }
  let(:assessment) { create(:assessment, client: client, staff: staff) }

  before do
    request.headers.merge!(auth_headers(staff))
  end

  describe 'GET #index' do
    let!(:assessments) { create_list(:assessment, 3) }

    context 'without client_id' do
      it 'returns all assessments' do
        get :index
        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body).size).to eq(3)
      end
    end

    context 'with client_id' do
      let!(:client_assessments) { create_list(:assessment, 2, client: client) }

      it 'returns assessments for specific client' do
        get :index, params: { client_id: client.id }
        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body).size).to eq(2)
      end
    end
  end

  describe 'GET #show' do
    it 'returns the assessment' do
      get :show, params: { id: assessment.id }
      expect(response).to have_http_status(:success)
      expect(JSON.parse(response.body)['id']).to eq(assessment.id)
    end
  end

  describe 'POST #create' do
    let(:valid_attributes) do
      {
        client_id: client.id,
        staff_id: staff.id,
        assessment_type: 'initial',
        assessment_date: Date.today,
        summary: 'Initial assessment completed',
        overall_score: 75
      }
    end

    context 'with valid parameters' do
      it 'creates a new assessment' do
        expect {
          post :create, params: { assessment: valid_attributes }
        }.to change(Assessment, :count).by(1)

        expect(response).to have_http_status(:created)
      end
    end

    context 'with invalid parameters' do
      it 'returns unprocessable entity' do
        post :create, params: { assessment: { assessment_type: '' } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'PATCH #update' do
    context 'with valid parameters' do
      it 'updates the assessment' do
        patch :update, params: { 
          id: assessment.id, 
          assessment: { summary: 'Updated summary' } 
        }
        expect(response).to have_http_status(:success)
        expect(assessment.reload.summary).to eq('Updated summary')
      end
    end

    context 'with invalid parameters' do
      it 'returns unprocessable entity' do
        patch :update, params: { 
          id: assessment.id, 
          assessment: { assessment_type: '' } 
        }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'DELETE #destroy' do
    it 'destroys the assessment' do
      assessment # create the assessment
      expect {
        delete :destroy, params: { id: assessment.id }
      }.to change(Assessment, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  describe 'POST #finalize' do
    it 'finalizes the assessment' do
      post :finalize, params: { id: assessment.id }
      expect(response).to have_http_status(:success)
      
      assessment.reload
      expect(assessment.status).to eq('approved')
      expect(assessment.finalized_by).to eq(staff.id)
    end
  end
end