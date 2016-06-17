require "rubygems"
require "bundler/setup"

def system_cmd(cmd)
  system(cmd) || exit(1)
end

desc "builds the website"
task :build do
  system_cmd "bundle exec jekyll build"
end

desc "deploys the website"
task deploy: :build do
  system_cmd "git checkout master"
  system_cmd "cp -R _site/* ."
  system_cmd "rm -rf _site"
  system_cmd "git add ."
  system_cmd %(git commit -m "Site updated at #{Time.now.to_s}")
  system_cmd "git push origin master"
  system_cmd "git checkout jekyll"
  system_cmd "git push origin jekyll"
end
