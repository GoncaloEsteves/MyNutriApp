class Api::NutritionistsController < ApplicationController
  before_action :set_nutritionist, only: %i[ show ]

  # GET /nutritionists
  def index
    @nutritionists = Nutritionist.all

    if params[:name].present?
      @nutritionists = @nutritionists.where("nutritionists.name LIKE ?", "%#{params[:name]}%")
    end

    if params[:service_type].present?
      @nutritionists = @nutritionists.where("service_types.name LIKE ?", "%#{params[:service_type]}%")
    end

    if params[:location].present?
      @nutritionists = @nutritionists.where("locations.name LIKE ?", "%#{params[:location]}%")
    end

    render json: NutritionistBlueprint.render(
      @nutritionists
        .joins(services: [:location, :service_type])
        .includes(services: [:location, :service_type])
        .distinct
    )
  end

  # GET /nutritionists/1
  def show
    render json: NutritionistBlueprint.render(@nutritionist)
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_nutritionist
      @nutritionist = Nutritionist.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def nutritionist_params
      params.expect(nutritionist: [ :name ])
    end
end
