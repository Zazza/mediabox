importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/classes/')
document.executeOnce('/sincerity/templates/')
document.executeOnce('/data-fm/')
document.executeOnce('/data-auth/')

ThumbResource = Sincerity.Classes.define(function() {

    var Public = {}

    Public.handleInit = function(conversation) {
        conversation.addMediaTypeByName('text/html')
        conversation.addMediaTypeByName('text/plain')
    }

    Public.handlePost = function(conversation) {
        var auth = conversation.getCookie("auth")
        if (!auth || !session_check(auth.value)) {
            return
        }

        //var action = conversation.locals.get('action')
        //var current_directory = conversation.getCookie("current_directory")

        var query = conversation.entity.text
        return uploadThumb(conversation.locals.get('_id'), query)
    }

    return Public
}())