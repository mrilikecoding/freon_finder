class HomeController < ApplicationController

  def index
    render "home/home"
  end

  def get_list

      response = HTTParty.get('http://search.3taps.com/?auth_token=6480f6c096df27e96b7da685d3f1c1ee&heading=freon&rpp=100&sort=-timestamp')

      @postings = response["postings"]
      @next_page = response["next_page"]

      def check_response
          unless @next_page == -1 || @next_page == 0
            response = HTTParty.get("http://search.3taps.com/?auth_token=6480f6c096df27e96b7da685d3f1c1ee&heading=freon&rpp=100&sort=-timestamp&page=#{@next_page}")
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

      return render json: @postings.to_json
  end
end