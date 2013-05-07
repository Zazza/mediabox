importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/classes/')
document.executeOnce('/sincerity/templates/')
document.executeOnce('/data-fm/')
document.executeOnce('/data-auth/')

FmResource = Sincerity.Classes.define(function() {

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

        var action = conversation.locals.get('action')

        if (action == "copy") {
            var buffer = conversation.getCookie("buffer")
            if (!buffer)
                buffer = conversation.createCookie("buffer")

            var res = Array()
            var tmp
            var arr = conversation.entity.text.split("&")

            var bufferArray = JSON.parse(buffer.value)
            for ( var key in bufferArray ) {
                res[res.length] = '{"_id": "'+ bufferArray[key]._id+'", "name": "'+bufferArray[key].name+'"}'
            }

            for(var i=0;i<arr.length;i++) {
                if (!bufferExist(buffer.value, arr[i])) {
                    tmp = getFile(uid_get(), arr[i])
                    res[res.length] = '{"_id": "'+arr[i]+'", "name": "'+tmp.name+'"}'
                    //res[res.length] = {_id: arr[i], name: tmp.name}
                }
            }

            buffer.value = "[" + res.join(",") + "]"
            //buffer.value = res.join(",").toJSON()
            buffer.maxAge = -1
            buffer.path = "/"
            buffer.save()

            return buffer.value
        }
    }

    Public.handleGet = function(conversation) {
        var auth = conversation.getCookie("auth")
        if (!auth || !session_check(auth.value)) {
            return
        }

        var action = conversation.locals.get('action')
        var buffer = conversation.getCookie("buffer")

        /*
         switch (action) {
         case fs:
         return fs();
         break;
         case "chdir":

         break;
         case "upload":

         break;
         case "create":
         break;
         default:
         return
         break;
         }
         */
        var current_directory = conversation.getCookie("current_directory");

        if (action == "fs") {
            var id = conversation.query.get("id")
            if (!id) {
                return '[{"text": "Upload", "id": "0", "expanded": true, "hasChildren": true, "spriteCssClass": "rootfolder"}]'
            }

            return fs(uid_get(), id);
        } else if (action == "chdir") {
            if (!current_directory) {
                current_directory = conversation.createCookie("current_directory")
            }

            current_directory.value = conversation.query.get("id")
            current_directory.maxAge = -1
            current_directory.path = "/"
            current_directory.save()

            return getFiles(uid_get(), conversation.query.get("id"));
        } else if (action == "upload") {
            return uploadFile(uid_get(), conversation.query.get("file"), conversation.query.get("size"), conversation.query.get("extension"), current_directory.value);
        } else if (action == "create") {
            return addFolder(uid_get(), conversation.query.get("name"), current_directory.value);
        } else if (action == "remove") {
            return removeFile(uid_get(), conversation.query.get("file"), current_directory.value);
        } else if (action == "getThumb") {
            return getThumb(uid_get(), conversation.query.get("name"));
        } else if (action == "buffer") {
            if (buffer)
                return buffer.value
        } else if (action == "past") {
            return bufferPast(uid_get(), buffer.value, current_directory.value)
        } else if (action == "rmFolder") {
            return rmFolder(uid_get(), conversation.query.get("name"), current_directory.value)
        }
    }

    return Public
}())