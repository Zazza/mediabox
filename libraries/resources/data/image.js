importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/classes/')
document.executeOnce('/sincerity/templates/')
document.executeOnce('/data-image/')
document.executeOnce('/data-auth/')

ImageResource = Sincerity.Classes.define(function() {

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

        if (action == "setCrop") {
            return setCrop(
                conversation.query.get("_id"),
                conversation.query.get("desc"),
                conversation.query.get("ws"),
                conversation.query.get("x1"),
                conversation.query.get("x2"),
                conversation.query.get("y1"),
                conversation.query.get("y2")
            );
        } else if (action == "addTag") {
            return addTag(
                conversation.query.get("_id"),
                conversation.query.get("tag")
            );
        } else if (action == "getCrops") {
            return getCrops(conversation.query.get("id"));
        } else if (action == "getTags") {
            return getTags(conversation.query.get("id"));
        } else if (action == "addComment") {
            return addComment(
                conversation.query.get("id"),
                conversation.query.get("text")
            );
        } else if (action == "getComments") {
            return getComments(conversation.query.get("id"));
        }
    }

    return Public
}())