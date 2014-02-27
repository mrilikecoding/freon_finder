class HomeController < ApplicationController

  def index
    render "home/home"
  end

  def get_list
      response = HTTParty.get('http://search.3taps.com/?auth_token=6480f6c096df27e96b7da685d3f1c1ee&heading=freon&rpp=100')
      return render json: response["postings"].to_json
  end

end

