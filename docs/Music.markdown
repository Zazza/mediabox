Music
=================================

1. Interface
-----------------
![Image 1](http://tushkan.com/mediabox/music.jpg)

[Mediaelementjs](http://mediaelementjs.com/)  
[Formats](http://mediaelementjs.com/#devices)

2. Javascrips
-------------------  
<b>/mapped/js/player.js</b>  

$(this).player("load").player("play");  
$(this).player("pause");  
$(this).player("stop");  

<b>$(this)</b> - music object, example:
<pre>
$("#fs").on("dblclick", ".dfile", function(){
    $(this).player("load").player("play");
});
</pre>
