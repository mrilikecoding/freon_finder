FreonFinder::Application.routes.draw do
  mount JasmineRails::Engine => '/specs' if defined?(JasmineRails)

  root 'home#index'

  get '/list' =>  'home#get_list', :as => :list

  post '/csv/:data' => 'home#create_csv', :as => :csv

end
