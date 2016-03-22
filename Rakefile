
task :deploy do
  system("bundle exec middleman deploy")
  system("git checkout scheduled")
  system("git pull origin scheduled")
  system("git checkout gh-pages")
  system("git merge scheduled")
  system("git push origin gh-pages")
  system("git checkout master")
end

task :sync_draft do
  system("git checkout draft")
  system("git pull origin draft")
  system("git merge master")
  system("git push origin draft")
  system("git checkout master")
end

namespace :deploy do

  task :scheduled do
    system("bundle exec middleman deploy")
  end

end
