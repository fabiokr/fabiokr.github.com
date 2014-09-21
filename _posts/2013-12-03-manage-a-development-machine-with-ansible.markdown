---
layout: blog-post
title: "Manage a development machine with Ansible"
date: 2013-12-03 21:11
categories: [Ansible, Development]
---

[Ansible](http://www.ansibleworks.com) is an IT orchestration tool I've been playing with lately. Similar tools include [Chef](http://www.opscode.com/chef/) and [Puppet](http://puppetlabs.com). Some cools things about Ansible is that it is open source, and you don't need anything in your target machine (it just uses an ssh connection).

In this quickstart, I'll build an Ansible playbook to manage a personal Ubuntu desktop.

First step is to install Ansible. For Ubuntu, a repository is available:

{% highlight bash %}
$ sudo add-apt-repository ppa:rquillo/ansible
$ sudo apt-get update
$ sudo apt-get install ansible
{% endhighlight %}

Additional installation methods can be found in [this page](http://ansibleworks.com/docs/intro_installation.html).

Now, we create a directory that will hold our playbook:

{% highlight bash %}
$ mkdir my_playbook
{% endhighlight %}

A playbook is the source of instructions that ansible will run when provisioning.

{% highlight bash %}
$ touch playbook.yml
{% endhighlight %}

Ansible expects instructions in the `yml` format. Lets populate our playbook with an initial content:

{% highlight yaml %}
---
# the host in which the playbook will be run
- hosts: localhost
  # in this example, we using a localhost, so this is needed
  connection: local

  # the target user Ansible will impersonate when provisioning
  user: johndoe

  # this makes all tasks run with sudo by default
  sudo: true

  # additional variables
  vars:
    user: johndoe

  # roles are a way to group tasks; they will run in the sequence determined here
  roles:
    - system
{% endhighlight %}

The next step is to create an inventory file. This will hold a list of servers Ansible can run with:

{% highlight bash %}
$ touch inventory
{% endhighlight %}

{% highlight bash %}
localhost   ansible_connection=local
{% endhighlight %}

Now, lets create our roles. For this example, the idea is to have a `system` role that is responsible for setting up system libraries.

{% highlight bash %}
$ mkdir roles
$ mkdir roles/system
{% endhighlight %}

And our system main task:

{% highlight bash %}
$ touch roles/system/main.yml
{% endhighlight %}

And this is the content of our sytems task:

{% highlight yaml %}
---

# This is a task. Basically, it needs a module command. In this example, it
# also have a `name`, which will be displayed while running the task to give a
# better description of the running task.
- name: install
  # apt is our module. It installs debian packages. Here we are passing an
  # `{{ item }}` variable, which is the item from `with_items`
  apt: pkg={{ item }}
  # `with_items` will loop through a list and run the module passing each item
  # as `{{ item }}`
  with_items:
    # better shell
    - zsh
    # terminal multiplexer
    - tmux
    # terminal editor
    - vim-gtk
    # shh
    - ssh
    # ruby
    - ruby
    # ruby dev headers
    - ruby-dev
    # ruby package manager
    - rubygems

# This is an example of how to gather information from the machine. We
# run a command with the "shell" module and register the result into the
# "default_shell" variable
- name: zsh facts
  shell: 'echo $SHELL'
  register: default_shell
  # changed when determines when will this task be considered changed when running
  # ansible. In this case, we want it to always be false, as we are just
  # retrieving information.
  changed_when: False
  sudo: no

# Now, we want to set zsh as the default shell, unless it is already the default
# one.
- name: make zsh default
  shell:  chsh -s /bin/zsh {{ user }}
  # This task will run only when the following is true. In here, we check the
  # value registered previously within the "default_shell" variable.
  when: default_shell.stdout.find('/bin/zsh') == -1
{% endhighlight %}

Now, to run our playbook:

{% highlight bash %}
ansible-playbook -K -i inventory playbook.yml
{% endhighlight %}

`-K` will ask for the machine sudo password. `-i` will pass the inventory file to use.

For additional modules, look into the [Ansible modules documentation](http://www.ansibleworks.com/docs/modules.html).
