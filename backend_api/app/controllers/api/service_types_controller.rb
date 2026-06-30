class Api::ServiceTypesController < ApplicationController

  # GET /service_types
  def index
    @service_types = ServiceType.all
    render json: @service_types
  end
end
