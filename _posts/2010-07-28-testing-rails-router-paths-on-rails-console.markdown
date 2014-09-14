---
layout: blog-post
title: "Testing Rails router paths on Rails console"
date: 2010-07-28 00:00
categories: [Rails]
---
The Rails console is a pragmatic way to test and experiment code inside a Rails environment.

Sometimes it can be helpful to have access to the Rails router url paths helpers, e.g. products_path, new_product_path, etc. To be able to use these helpers on Rails 3, while in the console run this:

``` ruby
include Rails.application.routes.url_helpers
```

[Source](https://rails.lighthouseapp.com/projects/8994/tickets/4749-actioncontrollerurlwriter-removed-without-deprecation)
