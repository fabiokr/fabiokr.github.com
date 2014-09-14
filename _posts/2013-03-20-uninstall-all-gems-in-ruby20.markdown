---
layout: blog-post
title: "Uninstall all gems in Ruby 2.0"
date: 2013-03-20 10:40
categories: [Ruby]
---
Here is a command to uninstall all non default gems in Ruby 2.0:

```
gem list | cut -d" " -f1 | grep -v "test-unit\|psych\|minitest\|io-console\|rdoc\|bigdecimal\|rake\|json"  | xargs gem uninstall -aIx
```
