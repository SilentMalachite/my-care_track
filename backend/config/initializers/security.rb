# Security configuration
Rails.application.config.security = {
  # Password requirements
  password: {
    min_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_digit: true,
    require_special_char: true,
    special_chars: '!@#$%^&*(),.?":{}|<>',
    expiration_days: 90,
    history_limit: 5
  },
  
  # Login security
  login: {
    max_attempts: 5,
    lockout_duration: 30.minutes
  }
}