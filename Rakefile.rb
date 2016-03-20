def deploy(env)
  puts "Deploying to #{env}"
  system "TARGET=#{env} bundle exec middleman deploy"
end

task :deploy do
  deploy :production
end

namespace :deploy do
  task :schedule do
    deploy :schedule
  end
end
