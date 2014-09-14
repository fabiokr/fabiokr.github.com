---
layout: blog-post
title: "Rails 3 responders, JQuery 1.4 and empty json results"
date: 2010-03-30 00:00
categories: [Rails, Jquery, Javascript]
---
 So, I have been playing with Rails 3 for a while, and it is really great! One of the new things I'm liking on it is the concept of
[responders](\"http://ryandaigle.com/articles/2009/8/10/what-s-new-in-edge-rails-default-restful-rendering\"). It helps to thin your controllers and encapsulate same logic on the same place.

Rails 3 responders have a default behavior to deal with api formats, like xml and json, so you don't have to create a responder to deal with that. This week I was programming a tool in which I would use Rails 3 and JQuery 1.4 and json communication. The ideia was that the user would be able to create, edit and destroy items on the same page with ajax, not a big deal. My problems started when I was creating the update form. Rails was, for some reason, responding with an empty json during updates. On create functions, respond_with returns the model attributes jsonified.

As Rails was returning an empty json object, I was having problems on the Jquery side, as Jquery 1.4 does a
[strict parse](\"http://api.jquery.com/jQuery.ajax/\") of a json object. That means that an empty string does not parse to a json object, and so Jquery throws an error, and as I was using $.ajax function, I falled on the error callback instead of the success callback.

After a while I discovered that Rails does that on purpose (at least for now). On the Rails source file /actionpack-3.0.0.beta/lib/action_controller/metal/responder.rb, on line 154, the api_behavior method defines returns for gets, posts, and errors, and everything else just returns an empty :ok header. I did not have an answer for why the Rails team has made it this way, but I have found a
[possible motive](\"http://metaskills.net/2008/5/24/the-ajax-head-br-design-pattern\").

Anyway, for this to work, I think there are two possible solutions. One would be to create a custom responder that would respond with an empty json object. The other one is to filter the response on Jquery side. For now I'm filtering the response with this:

``` javascript
$.ajax({ url: '/my_url', type: 'POST', data: form.serialize(
  dataFilter: function(data,type) {
    if(!data || $.trim(data) == "") return "{}"; return data;
  },
  success: function(data, status, req) { //success behavior },
  error: function(req, status, error) { //error behavior }
});
```

That's it, maybe this can help someone else :)
