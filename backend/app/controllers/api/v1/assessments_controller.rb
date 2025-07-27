module Api
  module V1
    class AssessmentsController < ApplicationController
      before_action :set_assessment, only: [:show, :update, :destroy, :finalize]
      before_action :set_client, only: [:index, :create]

      def index
        @assessments = @client ? @client.assessments : Assessment.all
        @assessments = @assessments.includes(:client, :staff, :support_plan)
                                     .by_date
                                     .page(params[:page])

        render json: @assessments
      end

      def show
        render json: @assessment
      end

      def create
        @assessment = Assessment.new(assessment_params)
        @assessment.client = @client if @client

        if @assessment.save
          render json: @assessment, status: :created
        else
          render json: @assessment.errors, status: :unprocessable_entity
        end
      end

      def update
        if @assessment.update(assessment_params)
          render json: @assessment
        else
          render json: @assessment.errors, status: :unprocessable_entity
        end
      end

      def destroy
        @assessment.destroy
        head :no_content
      end

      def finalize
        if @assessment.finalize!(@current_staff)
          render json: @assessment
        else
          render json: { error: 'Unable to finalize assessment' }, status: :unprocessable_entity
        end
      end

      private

      def set_assessment
        @assessment = Assessment.find(params[:id])
      end

      def set_client
        @client = Client.find(params[:client_id]) if params[:client_id]
      end

      def assessment_params
        params.require(:assessment).permit(
          :client_id, :staff_id, :support_plan_id, :assessment_type,
          :assessment_date, :summary, :overall_score, :strengths,
          :challenges, :recommendations, :goals, :status, :notes,
          category_scores: {}
        )
      end
    end
  end
end