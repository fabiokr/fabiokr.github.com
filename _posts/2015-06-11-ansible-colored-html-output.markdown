---
layout: blog-post
title: "Ansible colored html output"
date: 2015-06-11 08:40
categories: [Ansible, Development]
---

If you run Ansible in some automated way, you might miss the colored output it gives you when you run it through a terminal. I like it because it helps me to quickly check what has been modified in the run. I couldn't find anything that did what I wanted, and I didn't want to mess with the default Ansible output too, so what I did was to build a simple parser that transforms the default output into an html full of colors.

Because we use Ruby on the automation stack at [Eng5.com](http://eng5.com), the script is in Ruby. To use it, just place both the ruby file and the erb together, and use it like `Ansible.new.parse(original_ansible_output)`. You'll get a string back with the html version.

It is not a full featured colored output (it does not parse multi line errors for example), but it does the trick for most part.

- [Ruby Script](https://gist.github.com/fabiokr/5c51f4e3c76d3fbaa3f2)
- [HTML Template](https://gist.github.com/fabiokr/6cd0da3797d47f701ad4)
