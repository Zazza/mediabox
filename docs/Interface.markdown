Mediabox interface
=================================

1. Main
-----  
![Image 1](http://tushkan.com/mediabox/int1.jpg)

### 1) Top Menu: ###

- **File Manager**
- **<del>Profile</del>**
- **<del>Settings</del>**
- **<del>Logout</del>**

### 2) Left menu: ###
- **File system view**: File manages (copy, past ...). Show images, play music and video
- **Images file view** Show only images. Sort by tags and crops.

### 3) Main filemanager menu: ###
- **All** Show all formats
- **Images**
- **Video**
- **Music**

File formats may be change in settings.js: 
<pre>
app.globals = {  
...
    mediaTypes: {  
        image: 'img/ftypes/image.png',  
        doc: 'img/ftypes/msword.png',  
        pdf: 'img/ftypes/pdf.png',  
        txt: 'img/ftypes/text.png',  
        flv: 'img/ftypes/flash.png',  
        exe: 'img/ftypes/executable.png',  
        xls: 'img/ftypes/excel.png',  
        audio: 'img/ftypes/audio.png',  
        html: 'img/ftypes/html.png',  
        zip: 'img/ftypes/compress.png',  
        video: 'img/ftypes/flash.png',  
        any: 'img/ftypes/unknown.png'  
    },  
    extension: [  
        ['image', 'bmp', 'jpg', 'jpeg', 'gif', 'png'],  
        ['audio', 'ogg', 'mp3'],  
        ['video', 'mp4', 'mov', 'wmv', 'flv', 'avi'],  
        ['text', 'txt'],  
        ['doc', 'doc', 'rtf', 'docx'],  
        ['pdf', 'pdf', 'djvu'],  
        ['txt', 'txt', 'lst', 'ini'],  
        ['flv', 'flv'],  
        ['exe', 'exe', 'com',' bat', 'sh'],  
        ['xls', 'xls', 'xlsx'],  
        ['html', 'htm', 'html', 'shtml'],  
        ['zip', 'zip', 'rar', 'tar', 'gz', '7z']  
    ]  
}  
</pre>

### 4) Buttons: ###
- **Playlist**  
Audio playlist  
Music may be added in plylist by drag and drop or <b>"All to playlist button"</b> (5) in <b>Music</b> tab.  
- **Upload** Show all formats
Multiload file uploader. Drag and drop or button click <b>"Select..."</b>

- **Buffer** Show all formats  
Clipboard for copy-past operations  
(display of files in buffer still badly works)  


### 5) File operations: ###
- **New folder**  
- **Copy**  
- **Past**  
- **Slideshow**  swipebox.js plugin (modify for mediabox) - show images in fullscreen, left and right buttons on keyboard for rewind
- **All to playlist** (for audio, in plan video too)

### 6) <del>Volume:</del> ###
General for all players volume level

### 7) <del>Folder size:</del> ###

### 8) Select/Unselect: ###

### 8) <del>File view and sort mode</del> ###


2. Images viewer
-----  
![Image 2](http://tushkan.com/mediabox/int2.jpg)