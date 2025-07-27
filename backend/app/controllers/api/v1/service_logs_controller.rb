class Api::V1::ServiceLogsController < ApplicationController
  before_action :set_service_log, only: [:show, :update, :destroy, :approve]

  def index
    service_logs = ServiceLog.includes(:client, :staff, :support_plan).all

    # Filter by client_id
    service_logs = service_logs.where(client_id: params[:client_id]) if params[:client_id].present?

    # Filter by staff_id
    service_logs = service_logs.where(staff_id: params[:staff_id]) if params[:staff_id].present?

    # Filter by date range
    if params[:start_date].present? && params[:end_date].present?
      service_logs = service_logs.where(service_date: params[:start_date]..params[:end_date])
    end

    # Filter by service_type
    service_logs = service_logs.where(service_type: params[:service_type]) if params[:service_type].present?

    # Filter by status
    service_logs = service_logs.where(status: params[:status]) if params[:status].present?

    # Pagination
    if params[:page].present? && params[:limit].present?
      page = params[:page].to_i
      limit = params[:limit].to_i
      offset = (page - 1) * limit
      total = service_logs.count
      total_pages = (total.to_f / limit).ceil
      
      paginated_logs = service_logs.limit(limit).offset(offset)
      
      render json: {
        data: paginated_logs,
        pagination: {
          total: total,
          totalPages: total_pages,
          currentPage: page,
          limit: limit
        }
      }
    else
      render json: service_logs
    end
  end

  def show
    render json: @service_log
  end

  def create
    @service_log = ServiceLog.new(service_log_params)
    
    if @service_log.save
      render json: @service_log, status: :created
    else
      render json: { errors: @service_log.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @service_log.status == 'approved'
      render json: { error: 'Cannot update approved service log' }, status: :unprocessable_entity
    elsif @service_log.update(service_log_params)
      render json: @service_log
    else
      render json: { errors: @service_log.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    if @service_log.status == 'approved'
      render json: { error: 'Cannot delete approved service log' }, status: :unprocessable_entity
    else
      @service_log.destroy
      head :no_content
    end
  end

  def approve
    if @service_log.status == 'approved'
      render json: { error: 'Service log is already approved' }, status: :unprocessable_entity
    else
      @service_log.update!(
        status: 'approved',
        approved_by: params[:approved_by],
        approved_at: Time.current
      )
      render json: @service_log
    end
  end

  def statistics
    service_logs = ServiceLog.all

    # Filter by date range if provided
    if params[:start_date].present? && params[:end_date].present?
      service_logs = service_logs.where(service_date: params[:start_date]..params[:end_date])
    end

    total = service_logs.count
    by_status = service_logs.group(:status).count
    by_service_type = service_logs.group(:service_type).count
    
    render json: {
      total: total,
      by_status: by_status,
      by_service_type: by_service_type
    }
  end

  private

  def set_service_log
    @service_log = ServiceLog.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Service log not found' }, status: :not_found
  end

  def service_log_params
    params.require(:service_log).permit(
      :client_id, :support_plan_id, :staff_id, :service_date, :start_time, :end_time,
      :service_type, :details, :achievements, :issues, :next_actions, :mood_level,
      :health_status, :attachments, :notes, :status
    )
  end
end