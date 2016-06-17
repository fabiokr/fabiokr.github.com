require "rubygems"
require "bundler/setup"

desc "builds the website"
task :build do
  system "bundle exec jekyll build"
end

desc "deploys the website"
task deploy: :build do
  system "git checkout master"
  system "cp -R _site/* ."
  system "rm -rf _site"
  system "git add ."
  system %(git commit -m "Site updated at #{Time.now.to_s}")
  system "git push origin master"
  system "git checkout jekyll"
  system "git push origin jekyll"
end
