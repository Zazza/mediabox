document.executeOnce('/resources/data/fm/')
document.executeOnce('/resources/data/thumb/')
document.executeOnce('/resources/data/image/')
document.executeOnce('/resources/data/audio/')

resources = {
    fm: new FmResource(),
    thumb: new ThumbResource(),
    image: new ImageResource(),
    audio: new AudioResource()
}
