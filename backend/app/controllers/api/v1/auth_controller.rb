class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:login]

  def login
    staff = Staff.find_by(email: params[:email])

    if staff.nil?
      render json: { error: 'メールアドレスまたはパスワードが正しくありません' }, status: :unauthorized
      return
    end

    unless staff.can_login?
      if staff.locked?
        render json: { error: 'アカウントがロックされています' }, status: :unauthorized
      else
        render json: { error: 'アカウントが無効です' }, status: :unauthorized
      end
      return
    end

    if staff.authenticate(params[:password])
      if staff.password_expired?
        render json: { 
          error: 'パスワードの有効期限が切れています',
          password_expired: true 
        }, status: :forbidden
        return
      end

      staff.update_last_login!
      token = encode_token({ staff_id: staff.id })
      
      render json: { 
        token: token,
        staff: staff_json(staff)
      }, status: :ok
    else
      staff.increment_failed_login_attempts!
      render json: { error: 'メールアドレスまたはパスワードが正しくありません' }, status: :unauthorized
    end
  end

  def change_password
    unless @current_staff.authenticate(params[:current_password])
      render json: { error: '現在のパスワードが正しくありません' }, status: :unprocessable_entity
      return
    end

    if params[:new_password] != params[:new_password_confirmation]
      render json: { error: '新しいパスワードが一致しません' }, status: :unprocessable_entity
      return
    end

    @current_staff.password = params[:new_password]
    @current_staff.password_confirmation = params[:new_password_confirmation]

    if @current_staff.save
      render json: { message: 'パスワードを変更しました' }, status: :ok
    else
      render json: { errors: @current_staff.errors }, status: :unprocessable_entity
    end
  end

  def logout
    # In a stateless JWT system, logout is typically handled client-side
    # by removing the token. This endpoint is for logging purposes.
    render json: { message: 'ログアウトしました' }, status: :ok
  end

  private

  def staff_json(staff)
    {
      id: staff.id,
      staff_number: staff.staff_number,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      status: staff.status,
      password_expired: staff.password_expired?
    }
  end
end