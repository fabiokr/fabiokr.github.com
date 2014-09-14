---
layout: blog-post
title: "Manageable Content - Rails 3.1 Content Management Engine"
date: 2011-08-23 23:37
categories: [Rails]
---
Hi there!

This is a tutorial post about a gem I have just released:
[manageable_content](https://github.com/fabiokr/manageable_content). It is a content management framework for Rails 3.1. It provides a basic mapping between controllers to manageable contents. More detailed info can be found on the
[README](https://github.com/fabiokr/manageable_content/blob/master/README.rdoc) file.

In this post, I'll show how to create a new Rails project using the engine. The full example is available in
[Github](https://github.com/fabiokr/manageable_content_example_app). So, let the fun begin!

The first step is to create a new Rails app. Right now the engine requires Rails 3.1, so be sure to have it installed:

```
rails new manageable_content_example_app
```

So, the ideia of the website is to allow each page to have its own title in a manageable way. We will also have two controllers, Home and Contact. Home controller will have a body content, and Contact will have a body and a side content. Also, we need a content for the footer that will be shared across all pages. 

Let's generate our controllers first:

```
rails g controller home index --no-helper
rails g controller contact index --no-helper
```

In
[this commit](https://github.com/fabiokr/manageable_content_example_app/commit/c90fae643a6dc778d6b744487b6f9abe81f8c7c9) I have added sample contents so that you can see which contents we want to be manageable.

Ok, now we need to add manageable_content to our Gemfile. This line needs to be added:

``` ruby
gem 'manageable_content'
```

Then, run the 'bundle' command to install it. After that, we need to import and run the engine migrations:

```
bundle exec rake manageable_content_engine:install:migrations
bundle exec rake db:migrate
```

The next step is to make the engine Dsl available for our controllers. We need to add this to our application_controller:

``` ruby
include ManageableContent::Controllers::Dsl
```

We will start with our title content. Let's make the title content manageable for all controllers in our website by adding this to our application_controller:

``` ruby
manageable_content_for :title
```
 
Now run:

```
bundle exec rake manageable_content:generate
```

This command will generate our contents in the database based on our controllers configurations. We should than use the engine helper to print the manageable content in our views. You can see how I have done that in
[this commit](https://github.com/fabiokr/manageable_content_example_app/commit/340b254aa6f2cd4e41b022f398f01f6f8e783609). Now, we need a place in which we can edit our manageable contents. In
[this commit](https://github.com/fabiokr/manageable_content_example_app/commit/702b4cd266e33d24ff5d25ca13a7c5b075ecf206) and in
[this one](https://github.com/fabiokr/manageable_content_example_app/commit/4c6f599b9c9ec8b973e57cfd13638d8915f703d4) I created a basic administration page to manage the pages. An important thing to remeber is that the admin controller should inherit from a controller different that the application_controller, otherwise your admin controller will have manageable contents too!

Now, by accessing the admin page and saving some title contents, if we access our website pages their titles should be using the manageable contents. In our pages admin, you can notice that there was a page for our home controller, contact controller and for the application controller. To use the application controller title in our views, we have to use the manageable_layout_content_for helper. Check
[this commit](https://github.com/fabiokr/manageable_content_example_app/commit/f1043c56d2923b0c4eb07e24f7c0b7fdfc0816a7).

We can also have content that will be shared by all pages. In our website, the 'footer' content has to be like that. On our application_controller, we add this:

``` ruby
manageable_layout_content_for :footer
```

Than, after generating our contents with 'bundle exec rake manageable_content:generate', the footer content should be list under the 'application' page on our admin. To use it in our views, just add this:

``` ruby
manageable_layout_content_for :footer
```

The commit for this step is
[this one](https://github.com/fabiokr/manageable_content_example_app/commit/5352ca2cb8d4483243c78d2abec0586a4e6adfd8).

To finish this example, we will add contents that will be specific to our home and contact controller. Home controller will have a body content, and contact will have a body and a side content. Add this to the controllers:

home_controller:

``` ruby
manageable_content_for :body
```

contact_controller:

``` ruby
manageable_content_for :body, :side
```

After generating the contents, we can manage them thought the admin interface, and use them in our views with the helper, as you can
[see here.](https://github.com/fabiokr/manageable_content_example_app/commit/633022f5d4d45d3e3735556caae80045b65098bd)

So basically, that's it!

	The ideia was to create a simple to use and generic content manager for Rails. The source code is available in
[GIthub](https://github.com/fabiokr/manageable_content) and it is open for collaboration.
