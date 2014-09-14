---
layout: blog-post
title: "Guake autostart script with Rails"
date: 2012-07-05 17:23
categories: [Linux Ubuntu Rails]
---
I use
[Guake](http://guake.org/) terminal in my development
[Ubuntu](http://www.ubuntu.com) machine, and most of the time I find myself repeating a ton of commands to start my Rails devlopment environment, each process under its own tab. So today I finally took some time to setup a simple script that sets up Guake the way I want it. By adding something like the following to your .bashrc file, you'll be able to start it by running the "guake-my-project" command:

```
guake-my-project() {  
	  guake --rename-tab=Specs" --execute-command="cd ~/path/to/project && bundle exec guard" &&  
	  guake --new-tab=2 --rename-tab="Server" --execute-command="cd ~/path/to/project && rails s" &&  
	  guake --new-tab=3 --rename-tab="MyProject" --execute-command="cd ~/path/to/project";
	}
```
