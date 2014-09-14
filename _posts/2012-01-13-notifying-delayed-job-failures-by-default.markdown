---
layout: blog-post
title: "Notifying delayed_job failures by default"
date: 2012-01-13 12:35
categories: [Rails]
---
Here is a helpful code snippet to notify delayed_job errors by default in a Rails application. In a config/initializers file, add the following:

``` ruby
# Optional but recommended for less future surprises.
# Fail at startup if method does not exist instead of in background job 
[[Airbrake, :notify]].each do |object, method_name|
  raise NoMethodError, "undefined method `#{method_name}' for #{object.inspect}" unless object.respond_to?(method_name, true)
end

# Chain delayed job's handle_failed_job method to do exception notification
Delayed::Worker.class_eval do 
  def handle_failed_job_with_notification(job, error)
    handle_failed_job_without_notification(job, error)

    # only actually send mail in production
    if Rails.env.production?
      # rescue if ExceptionNotifier fails for some reason
      begin
        Airbrake.notify(error)
      rescue Exception => e
        Rails.logger.error "Airbrake failed: #{e.class.name}: #{e.message}"

        e.backtrace.each do |f|
          Rails.logger.error "  #{f}"
        end

        Rails.logger.flush
      end
    end
  end 

  alias_method_chain :handle_failed_job, :notification 
end
```

In this example, Airbrake is being used for error notification, but this can be easily changed to the desired notification method.

Credits to this thread: 
[http://stackoverflow.com/questions/5972903/how-to-make-exceptionnotifier-work-with-delayed-job-in-rails-3](http://stackoverflow.com/questions/5972903/how-to-make-exceptionnotifier-work-with-delayed-job-in-rails-3)
