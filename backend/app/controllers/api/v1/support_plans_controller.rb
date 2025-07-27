class Api::V1::SupportPlansController < ApplicationController
  before_action :set_support_plan, only: [:show, :update, :destroy, :complete]

  def index
    support_plans = SupportPlan.includes(:client).all

    # Filter by client_id
    support_plans = support_plans.where(client_id: params[:client_id]) if params[:client_id].present?

    # Filter by status
    support_plans = support_plans.where(status: params[:status]) if params[:status].present?

    # Pagination
    if params[:page].present? && params[:limit].present?
      page = params[:page].to_i
      limit = params[:limit].to_i
      offset = (page - 1) * limit
      total = support_plans.count
      total_pages = (total.to_f / limit).ceil
      
      paginated_plans = support_plans.limit(limit).offset(offset)
      
      render json: {
        data: paginated_plans,
        pagination: {
          total: total,
          totalPages: total_pages,
          currentPage: page,
          limit: limit
        }
      }
    else
      render json: support_plans
    end
  end

  def show
    render json: @support_plan
  end

  def create
    @support_plan = SupportPlan.new(support_plan_params)
    
    if @support_plan.save
      render json: @support_plan, status: :created
    else
      render json: { errors: @support_plan.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @support_plan.update(support_plan_params)
      render json: @support_plan
    else
      render json: { errors: @support_plan.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    # Check for associated service logs
    if @support_plan.service_logs.exists?
      render json: { error: 'Cannot delete support plan with associated records' }, status: :unprocessable_entity
    else
      @support_plan.destroy
      head :no_content
    end
  end

  def statistics
    total = SupportPlan.count
    by_status = SupportPlan.group(:status).count
    
    render json: {
      total: total,
      by_status: by_status
    }
  end

  def complete
    @support_plan.update!(status: 'completed', completed_at: Time.current)
    render json: @support_plan
  end

  private

  def set_support_plan
    @support_plan = SupportPlan.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Support plan not found' }, status: :not_found
  end

  def support_plan_params
    params.require(:support_plan).permit(
      :client_id, :plan_name, :goals, :start_date, :end_date, :status, 
      :priority, :assigned_staff_ids, :notes, :plan_number
    )
  end
end