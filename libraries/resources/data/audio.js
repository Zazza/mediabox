importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/classes/')
document.executeOnce('/sincerity/templates/')
document.executeOnce('/data-audio/')
document.executeOnce('/data-auth/')

AudioResource = Sincerity.Classes.define(function() {

    var Public = {}

    Public.handleInit = function(conversation) {
        conversation.addMediaTypeByName('text/html')
        conversation.addMediaTypeByName('text/plain')
    }

    Public.handleGet = function(conversation) {
        var auth = conversation.getCookie("auth")
        if (!auth || !session_check(auth.value)) {
            return
        }

        var action = conversation.locals.get('action')

        var volume = conversation.getCookie("volume");

        if (action == "volume") {
            if (!volume) {
                volume = conversation.createCookie("volume")
                volume.value = conversation.query.get("level")
                volume.maxAge = -1
                volume.path = "/"
                volume.save()
            } else {
                volume.value = conversation.query.get("level")
                volume.maxAge = -1
                volume.path = "/"
                volume.save()
            }
        }
    }

    return Public
}())