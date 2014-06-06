class Posting < ActiveRecord::Base

  def self.get_postings

    # @search_term = "freon"
    @search_term = "r12|r-12"

    response = HTTParty.get(URI.encode("http://search.3taps.com/?auth_token=6480f6c096df27e96b7da685d3f1c1ee&heading=#{@search_term}&rpp=100&sort=-timestamp"))
    @postings = response["postings"]
    @next_page = response["next_page"]

    def self.check_response
      unless @next_page == -1 || @next_page == 0
        response = HTTParty.get(URI.encode("http://search.3taps.com/?auth_token=6480f6c096df27e96b7da685d3f1c1ee&heading=#{@search_term}&rpp=100&sort=-timestamp&page=#{@next_page}"))
        response["postings"].each do |response|
          @postings.push(response)
        end

        @next_page = response["next_page"]
        puts "API request made: #{@postings.size} total results"
        self.check_response
      end
      @postings
    end

    self.check_response
    puts "Postings: #{@postings.size}"

    posting = Posting.new(:postings => @postings.to_json)
    posting.save!

    if posting.save
      puts "Success"
    else
      puts "Error saving postings"
    end
  end


  def self.grab_postings
    postings = []

    Posting.all.each do |p|
      postings_collection =  JSON.parse(p.postings)
      postings_collection.each do |item|
        postings.push(item)
      end
    end

    return postings.uniq
  end

end
