importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/classes/')
document.executeOnce('/sincerity/templates/')
document.executeOnce('/data-auth/')

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
        }

        var action = conversation.locals.get('action')

        var theme = conversation.getCookie("theme")
        var fsMenu = conversation.getCookie("fs_menu")
        var fsMenuLeft = conversation.getCookie("fs_menu_left")

        if (action == "theme") {
            if (!theme) {
                theme = conversation.createCookie("theme")
            }

            theme.value = conversation.query.get("theme")
            theme.maxAge = -1
            theme.path = "/"
            theme.save()

            return true;
        } else if (action == "fsMenu") {
            if (!fsMenu) {
                var fsMenu = conversation.createCookie("fs_menu")
            }

            fsMenu.value = conversation.query.get("tab")
            fsMenu.maxAge = -1
            fsMenu.path = "/"
            fsMenu.save()

            return true;
        } else if (action == "fsMenuLeft") {
            if (!fsMenuLeft) {
                fsMenuLeft = conversation.createCookie("fs_menu_left")
            }

            fsMenuLeft.value = conversation.query.get("tab")
            fsMenuLeft.maxAge = -1
            fsMenuLeft.path = "/"
            fsMenuLeft.save()

            return true;
        }
    }

    return Public
}())