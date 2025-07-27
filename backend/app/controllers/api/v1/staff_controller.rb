class Api::V1::StaffController < ApplicationController
  before_action :authenticate_user!
  before_action :set_staff, only: [:show, :update, :destroy]

  # GET /api/v1/staff
  def index
    @staff = Staff.all
    
    # 検索フィルタ
    if params[:search].present?
      @staff = @staff.where("name LIKE ? OR email LIKE ?", "%#{params[:search]}%", "%#{params[:search]}%")
    end
    
    # 部署フィルタ
    if params[:department].present?
      @staff = @staff.where(department: params[:department])
    end
    
    # 役職フィルタ  
    if params[:role].present?
      @staff = @staff.where(role: params[:role])
    end
    
    # アクティブステータスフィルタ
    if params[:is_active].present?
      @staff = @staff.where(status: params[:is_active] == 'true' ? 'active' : 'inactive')
    end
    
    render json: serialize_staff(@staff)
  end

  # GET /api/v1/staff/active
  def active
    @staff = Staff.active
    render json: serialize_staff(@staff)
  end

  # GET /api/v1/staff/:id
  def show
    render json: serialize_staff_detail(@staff)
  end

  # POST /api/v1/staff
  def create
    @staff = Staff.new(staff_params)
    @staff.status = 'active'
    
    if @staff.save
      render json: serialize_staff_detail(@staff), status: :created
    else
      render json: { errors: @staff.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/staff/:id
  def update
    if @staff.update(staff_params)
      render json: serialize_staff_detail(@staff)
    else
      render json: { errors: @staff.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/staff/:id
  def destroy
    @staff.destroy
    head :no_content
  end

  # PATCH /api/v1/staff/:id/deactivate
  def deactivate
    @staff = Staff.find(params[:id])
    @staff.update!(status: 'inactive')
    render json: serialize_staff_detail(@staff)
  end

  private

  def set_staff
    @staff = Staff.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'スタッフが見つかりません' }, status: :not_found
  end

  def staff_params
    params.require(:staff).permit(
      :name, :email, :phone, :role, :department, 
      :hire_date, :staff_number, :specialties, :password
    )
  end
  
  def serialize_staff(staff)
    staff.map do |s|
      {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: s.role,
        department: s.department,
        isActive: s.status == 'active',
        hireDate: s.hire_date,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }
    end
  end
  
  def serialize_staff_detail(staff)
    {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      isActive: staff.status == 'active',
      hireDate: staff.hire_date,
      staffNumber: staff.staff_number,
      specialties: staff.specialties,
      createdAt: staff.created_at,
      updatedAt: staff.updated_at
    }
  end
end