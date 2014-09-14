---
layout: blog-post
title: "Record a screen cast to a gif file"
date: 2012-09-19 15:08
categories: [Ubuntu, Gif, Screenscast, Linux]
---
Here is a simple shell script that converts a recorded ogv file to an animated gif, pretty useful for demonstrating small interactions. For recording an ogv, I've been using Record my Desktop on Ubuntu. You'll also need mplayer, and imagemagick. Under Ubuntu/Debian, you can install those with this:

```
apt-get install imagemagick mplayer gtk-recordmydesktop
```

And here is the shell script:

``` sh
ogv_to_gif() {
  # Export into images
  mplayer -ao null $1 -vo jpeg:outdir=/tmp/ogv_to_gif

  # Convert images to animated gif
  echo "Converting images folder to gif..."
  convert /tmp/ogv_to_gif/* /tmp/ogv_to_gif.gif

  # Final filename
  original_filename=$1
  filename=${original_filename//ogv/gif}

  # Optimize gif
  echo "Optimizing generated gif..."
  convert /tmp/ogv_to_gif.gif -fuzz 10% -layers Optimize "$filename"

  # Cleans up tmp folders
  rm -rf /tmp/ogv_to_gif.gif /tmp/ogv_to_gif
}
```

 
