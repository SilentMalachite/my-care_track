class Api::V1::ClientsController < ApplicationController
  before_action :set_client, only: [:show, :update, :destroy]

  def index
    clients = Client.all

    # Filter by status
    clients = clients.where(status: params[:status]) if params[:status].present?

    # Search by name, name_kana, client_number, phone
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      clients = clients.where(
        "name LIKE ? OR name_kana LIKE ? OR client_number LIKE ? OR phone LIKE ?",
        search_term, search_term, search_term, search_term
      )
    end

    # Pagination
    if params[:page].present? && params[:limit].present?
      page = params[:page].to_i
      limit = params[:limit].to_i
      offset = (page - 1) * limit
      total = clients.count
      total_pages = (total.to_f / limit).ceil
      
      paginated_clients = clients.limit(limit).offset(offset)
      
      render json: {
        data: paginated_clients,
        pagination: {
          total: total,
          totalPages: total_pages,
          currentPage: page,
          limit: limit
        }
      }
    else
      render json: clients
    end
  end

  def show
    render json: @client
  end

  def create
    @client = Client.new(client_params)
    
    if @client.save
      render json: @client, status: :created
    else
      render json: { errors: @client.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @client.update(client_params)
      render json: @client
    else
      render json: { errors: @client.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    # Check for associated records
    if @client.support_plans.exists?
      render json: { error: 'Cannot delete client with associated records' }, status: :unprocessable_entity
    else
      @client.destroy
      head :no_content
    end
  end

  def search
    search_term = "%#{params[:q]}%"
    clients = Client.where(
      "name LIKE ? OR name_kana LIKE ? OR client_number LIKE ? OR phone LIKE ?",
      search_term, search_term, search_term, search_term
    )
    render json: clients
  end

  def statistics
    total = Client.count
    by_status = Client.group(:status).count
    
    render json: {
      total: total,
      by_status: by_status
    }
  end

  def check_client_number
    client_number = params[:client_number]
    exclude_id = params[:exclude_id]
    
    query = Client.where(client_number: client_number)
    query = query.where.not(id: exclude_id) if exclude_id.present?
    
    available = !query.exists?
    
    render json: { available: available }
  end

  private

  def set_client
    @client = Client.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Client not found' }, status: :not_found
  end

  def client_params
    params.require(:client).permit(
      :client_number, :name, :name_kana, :date_of_birth, :gender,
      :phone, :email, :address, :disability_type, :disability_grade,
      :insurance_number, :status, :notes
    )
  end
end