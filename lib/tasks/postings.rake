namespace :postings do

  desc "get current postings from 3taps"
  task :fetch => :environment  do
    Posting.connection
    Posting.get_postings
    puts "#{Time.now} Postings Updated"
  end

  desc "destroy postings older than two weeks"
  task :prune_old_records => :environment do
    Posting.where("created_at < :week", {:week => 1.week.ago}).delete_all
    puts "#{Time.now} Postings Pruned"
  end

end
