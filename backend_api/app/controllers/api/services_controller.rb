class Api::ServicesController < ApplicationController
  before_action :set_nutritionist, only: %i[ index show ]
  before_action :set_service, only: %i[ show ]

  # GET /nutritionists/1/services
  def index
    @services = Service.joins(:nutritionist_services)
      .where(nutritionist_services: { nutritionist_id: @nutritionist.id })

    render json: ServiceBlueprint.render(@services)
  end

  # GET /nutritionists/1/services/1
  def show
    render json: ServiceBlueprint.render(@service)
  end

  private
    def set_nutritionist
      @nutritionist = Nutritionist.find(params.expect(:nutritionist_id))
    end

    # Use callbacks to share common setup or constraints between actions.
    def set_service
      @service = Service.find(params.expect(:id))

      nutritionist_service = NutritionistService.find_by(
        nutritionist_id: @nutritionist.id,
        service_id: @service.id
      )
      unless nutritionist_service
        return render json: { error: "NUTRITIONISTSERVICE.NOTFOUND" }, status: :not_found
      end
    end
end
