module AuthHelper
  def generate_auth_token(staff)
    payload = { staff_id: staff.id, exp: 24.hours.from_now.to_i }
    JWT.encode(payload, jwt_secret, 'HS256')
  end

  def jwt_secret
    Rails.application.credentials.secret_key_base || ENV['SECRET_KEY_BASE'] || 'development_secret_key'
  end

  def auth_headers(staff)
    { 'Authorization' => "Bearer #{generate_auth_token(staff)}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelper, type: :controller
  config.include AuthHelper, type: :request
end