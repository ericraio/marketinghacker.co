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
    system "git add schedule.txt"
    system "git commit -m 'setting schedule for next post'"
    system "git push origin master"
  end
end
