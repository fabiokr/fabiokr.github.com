---
layout: blog-post
title: "Jquery silently fails on ajax errors"
date: 2012-09-12 18:38
categories: [Jquery, Javascript]
---
Context: you have an ajax call that returns javascript code. If that javascript raises a runtime error, it turns out that Jquery will engulf it and you will have a hard time finding out what is failling.

This is what I came up with to force raising when that kind of thing happens:

``` coffeescript
$ ->
	$(this).on "ajax:error", (e, xhr, data, error) ->
    throw error
```

Code is in Coffeescript, by the way.
