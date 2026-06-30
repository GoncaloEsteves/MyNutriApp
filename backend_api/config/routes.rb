Rails.application.routes.draw do
  namespace :api do

    resources :nutritionists, only: [ :index, :show ] do
      resources :services, only: [ :index, :show ] do
        resources :appointments, only: [ :create ]
      end

      resources :appointments, only: [ :index ]
    end

    resources :appointments, only: [] do
      member do
        patch 'accept'
        patch 'reject'
      end
    end

    resources :service_types, only: [ :index ]
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
