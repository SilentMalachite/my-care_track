class ApplicationController < ActionController::API
  before_action :authenticate_request

  private

  def authenticate_request
    header = request.headers['Authorization']
    header = header.split(' ').last if header
    
    begin
      decoded = decode_token(header)
      @current_staff = Staff.find(decoded[:staff_id])
      
      unless @current_staff&.can_login?
        render json: { error: '認証エラー' }, status: :unauthorized
      end
    rescue ActiveRecord::RecordNotFound => e
      render json: { error: 'スタッフが見つかりません' }, status: :unauthorized
    rescue JWT::DecodeError => e
      render json: { error: '無効なトークンです' }, status: :unauthorized
    rescue => e
      render json: { error: '認証エラー' }, status: :unauthorized
    end
  end

  def encode_token(payload)
    payload[:exp] = 24.hours.from_now.to_i
    JWT.encode(payload, jwt_secret, 'HS256')
  end

  def decode_token(token)
    return nil unless token
    
    body = JWT.decode(token, jwt_secret, true, algorithm: 'HS256')[0]
    HashWithIndifferentAccess.new(body)
  end

  def jwt_secret
    Rails.application.credentials.secret_key_base || ENV['SECRET_KEY_BASE'] || 'development_secret_key'
  end
end