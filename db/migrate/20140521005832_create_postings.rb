class CreatePostings < ActiveRecord::Migration
  def change
    create_table :postings do |t|
      t.text :postings
    end
  end
end
