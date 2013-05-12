Project structure
=================================

1. Frontend
-----  

/mapped/index.d.html + /fragments/*  
/mapped/js/fm.js - general javascript file. Kendo UI  
/mapped/js/image.js  
/mapped/js/player.js  
/mapped/js/video.js  


2. Backend
-----  
**Controllers**

/libraries/data-auth.js  
/libraries/data-fm.js  
/libraries/data-image.js  
/libraries/data-audio.js  

**Models**  

/libraries/resources/data/auth.js  
/libraries/resources/data/app.js  
/libraries/resources/data/fm.js  
/libraries/resources/data/image.js  
/libraries/resources/data/thumb.js  
 /libraries/resources/data/audio.js  

3. File storage
-----  

settings.js:  
<pre>
app.globals = {
    config: {
        ...
        storage: 'http://tushkan.com/fm'
    },
...
</pre>

API
---
**1) Upload file:**  
http://STORAGE/save/  
XMLHttpRequest  

Example (/mapped/js/fm.js)
<pre>function sendFile(id, file) {...}</pre>

**2) Load file:**  
http://STORAGE/get/?id=[ID]*  


**3) Remove file:**  
http://STORAGE/remove/?id=[ID]*  

[ID]* - file ID