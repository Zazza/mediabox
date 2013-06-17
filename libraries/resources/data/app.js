importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/classes/')
document.executeOnce('/sincerity/templates/')
document.executeOnce('/data-auth/')
document.executeOnce('/data-session/')

AppResource = Sincerity.Classes.define(function() {

    var Public = {}

    Public.handleInit = function(conversation) {
        conversation.addMediaTypeByName('text/html')
        conversation.addMediaTypeByName('text/plain')
    }

    Public.handleGet = function(conversation) {
        var auth = conversation.getCookie("auth")
        if (!auth || !session_check(auth.value)) {
            return
        } else {
            setToken(auth.value)
        }

        var action = conversation.locals.get('action')

        if (action == "theme") {
            session_set("theme", conversation.query.get("theme"))
            return true
        } else if (action == "fsMenu") {
            session_set("fs_menu", conversation.query.get("tab"))
            return true
        } else if (action == "fsMenuLeft") {
            session_set("fs_menu_left", conversation.query.get("tab"))
            return true
        } else if (action == "volume") {
            session_set("volume", conversation.query.get("level"))
            return true
        }
    }

    return Public
}())