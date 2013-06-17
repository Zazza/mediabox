document.executeOnce('/resources/data/auth/')
document.executeOnce('/resources/data/app/')
document.executeOnce('/resources/data/fm/')
document.executeOnce('/resources/data/thumb/')
document.executeOnce('/resources/data/image/')

resources = {
    auth: new AuthResource(),
    app: new AppResource(),
    fm: new FmResource(),
    thumb: new ThumbResource(),
    image: new ImageResource()
}
