class Api::NutritionistsController < ApplicationController
  before_action :set_nutritionist, only: %i[ show update destroy ]

  # GET /nutritionists
  def index
    @nutritionists = Nutritionist.all

    render json: @nutritionists
  end

  # GET /nutritionists/1
  def show
    render json: @nutritionist
  end

  # POST /nutritionists
  def create
    @nutritionist = Nutritionist.new(nutritionist_params)

    if @nutritionist.save
      render json: @nutritionist, status: :created, location: @nutritionist
    else
      render json: @nutritionist.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /nutritionists/1
  def update
    if @nutritionist.update(nutritionist_params)
      render json: @nutritionist
    else
      render json: @nutritionist.errors, status: :unprocessable_content
    end
  end

  # DELETE /nutritionists/1
  def destroy
    @nutritionist.destroy!
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
