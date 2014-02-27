FreonFinder::Application.routes.draw do
  mount JasmineRails::Engine => '/specs' if defined?(JasmineRails)
  root 'home#index'
  get '/list' =>  'home#get_list', :as => :list
end
