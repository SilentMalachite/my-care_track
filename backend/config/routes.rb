Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # Auth routes
      post 'auth/login', to: 'auth#login'
      post 'auth/logout', to: 'auth#logout'
      post 'auth/change_password', to: 'auth#change_password'
      
      resources :clients do
        collection do
          get :search
          get :statistics
          post :check_client_number
        end
      end

      resources :support_plans do
        collection do
          get :statistics
        end
        member do
          post :complete
        end
      end

      resources :service_logs do
        collection do
          get :statistics
        end
        member do
          post :approve
        end
      end

      resources :assessments do
        collection do
          get :statistics
        end
        member do
          post :finalize
        end
      end
    end
  end
end
