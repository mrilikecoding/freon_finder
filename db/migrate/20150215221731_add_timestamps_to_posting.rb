class AddTimestampsToPosting < ActiveRecord::Migration
  def change
    add_column :postings, :created_at, :datetime
    add_column :postings, :updated_at, :datetime
  end
end
