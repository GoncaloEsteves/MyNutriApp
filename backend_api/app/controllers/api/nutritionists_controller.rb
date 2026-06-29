class Api::NutritionistsController < ApplicationController
  before_action :set_nutritionist, only: %i[ show ]

  # GET /nutritionists
  def index
    @nutritionists = Nutritionist.all

    if params[:searchBy].present?
      @nutritionists = @nutritionists.where("nutritionists.name LIKE ? OR service_types.name LIKE ?", "%#{params[:searchBy]}%", "%#{params[:searchBy]}%")
    end

    if params[:location].present?
      @nutritionists = @nutritionists.where("locations.name LIKE ?", "%#{params[:location]}%")
    end

    @nutritionists = @nutritionists
      .joins(services: [:location, :service_type])
      .includes(services: [:location, :service_type])
      .distinct

    render json: NutritionistBlueprint.render(@nutritionists)
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
end
