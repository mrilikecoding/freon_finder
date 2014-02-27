FreonFinder::Application.routes.draw do
  root 'home#index'
  get '/list' =>  'home#get_list', :as => :list
end
