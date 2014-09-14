---
layout: blog-post
title: "Vagrant SSHFS plugin"
date: 2013-12-01 20:50
categories: [Vagrant]
---

[Vagrant](http://vagrantup.com/) supports NFS by default to mount host directories in the client machine. In some situations that won't work well, so I developed an [SSH file system](https://github.com/fabiokr/vagrant-sshfs) plugin for it.

Basically, you have to install it and configure the mounted folders:

`vagrant plugin install vagrant-sshfs`

In the `VagrantFile`:

`config.sshfs.paths = { "src" => "mountpoint" }`

That will mount the `src` folder in the virtual box into the `mountpoint` folder in the host machine.

More information is available in the plugin [README](https://github.com/fabiokr/vagrant-sshfs) file.
