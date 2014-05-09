FreonFinder::Application.routes.draw do
  mount JasmineRails::Engine => '/specs' if defined?(JasmineRails)

  root 'home#welcome'

  get '/results' =>  'home#index',    :as => :results
  get '/list'    =>  'home#get_list', :as => :list

  post '/csv/:data' => 'home#create_csv', :as => :csv

end
