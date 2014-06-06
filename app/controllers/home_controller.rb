class HomeController < ApplicationController

  def welcome
    render "home/welcome"
  end

  def index
    @search_term = params[:search].present? ? params[:search] : "freon"
    puts params[:search]
    render "home/home"
  end

  def get_list
    @search_term = params[:search]
    @postings = []

    if @search_term.downcase == "r12" || @search_term.downcase == "r-12"
      @postings = Posting.grab_postings
      puts "Pulling Freon Postings from DB: #{@postings.count} records"
      return render json: @postings
    else
      response = HTTParty.get(URI.encode("http://search.3taps.com/?auth_token=6480f6c096df27e96b7da685d3f1c1ee&heading=#{@search_term}&rpp=100&sort=-timestamp"))
      @postings = response["postings"]
      @next_page = response["next_page"]

      def check_response
          unless @next_page == -1 || @next_page == 0
            response = HTTParty.get(URI.encode("http://search.3taps.com/?auth_token=6480f6c096df27e96b7da685d3f1c1ee&heading=#{@search_term}&rpp=100&sort=-timestamp&page=#{@next_page}"))
            response["postings"].each do |response|
              @postings.push(response)
            end

            @next_page = response["next_page"]
            puts "API request made: #{@postings.size} total results"
            check_response
          end
          @postings
      end

      check_response
      puts "Postings: #{@postings.size}"
      puts @postings.to_json

      return render json: @postings.to_json

    end
  end
end