importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/classes/')
document.executeOnce('/sincerity/templates/')
document.executeOnce('/data-auth/')
document.executeOnce('/data-session/')

AuthResource = Sincerity.Classes.define(function() {

    var Public = {}

    Public.handleInit = function(conversation) {
        conversation.addMediaTypeByName('text/html')
        conversation.addMediaTypeByName('text/plain')
    }

    Public.handlePost = function(conversation) {
        var action = conversation.locals.get('action')

        var auth = conversation.getCookie("auth");

        if (action == "login") {
            var input = conversation.entity.text.split("&")

            var email = input[0].split("=")[1]
            var password = input[1].split("=")[1]
            // if "remember me" flag
            if (input[2]) {
                var limit = application.globals.get('config.session_long_limit')
            } else {
                var limit = application.globals.get('config.session_limit')
            }

            var _id = checkLogin(email, password)

            if (!_id) {
                return '<meta http-equiv="refresh" content="1;URL='+application.globals.get('config.baseUrl')+'" />';
            }

            var token = session_start(_id, limit)

            if (!token) {
                return '<meta http-equiv="refresh" content="1;URL='+application.globals.get('config.baseUrl')+'" />';
            }

            auth = conversation.createCookie("auth")
            auth.value = token
            auth.maxAge = -1
            auth.path = "/"
            auth.save()

            return '<meta http-equiv="refresh" content="1;URL='+application.globals.get('config.baseUrl')+'" />';

        } else if (action == "registration") {
            var input = conversation.entity.text.split("&")

            var email = input[0].split("=")[1]
            var password = input[1].split("=")[1]

            if (registration(email, password)) {
                return '<meta http-equiv="refresh" content="1;URL='+application.globals.get('config.baseUrl')+'" />';
            } else {
                return '<meta http-equiv="refresh" content="1;URL='+application.globals.get('config.baseUrl')+'registration/" />';
            }
        } else if (action == "session") {
            var token = conversation.entity.text

            if (!session_check(token)) {
                auth.maxAge = 0
                auth.path = "/"
                auth.save()

                return '<meta http-equiv="refresh" content="1;URL='+application.globals.get('config.baseUrl')+'" />';
            }
        }
    }

    Public.handleGet = function(conversation) {
        var action = conversation.locals.get('action')

        var auth = conversation.getCookie("auth");

        if (action == "logout") {
            if (auth) {
                session_delete(auth.value)

                auth.maxAge = 0
                auth.path = "/"
                auth.save()

                return '<meta http-equiv="refresh" content="1;URL='+application.globals.get('config.baseUrl')+'" />';
            } else {
                return '<meta http-equiv="refresh" content="1;URL='+application.globals.get('config.baseUrl')+'" />';
            }
        }
    }

    return Public
}())