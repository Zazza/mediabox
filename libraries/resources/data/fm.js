importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/classes/')
document.executeOnce('/sincerity/templates/')
document.executeOnce('/data-fm/')
document.executeOnce('/data-auth/')
document.executeOnce('/data-session/')
document.executeOnce('/data-buffer/')

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
            var entity = conversation.entity.text
            var res = Array()
            var bufferArray = Array()
            var tmp
            var arr
            var arr_parts

            if (entity) {
                arr = entity.split("&")

                var buffer = getBuffer(uid_get())
                if (buffer) {
                    bufferArray = JSON.parse(buffer)

                    for ( var key in bufferArray ) {
                        res[res.length] = JSON.stringify(bufferArray[key])
                    }
                }

                for(var i=0;i<arr.length;i++) {
                    arr_parts = arr[i].split("=")
                    if (!bufferExist(buffer, arr_parts[1])) {
                        if (arr_parts[0] == "file") {
                            res[res.length] = getFile(uid_get(), arr_parts[1]);
                        } else if (arr_parts[0] == "folder") {
                            res[res.length] = getFolder(uid_get(), arr_parts[1]);
                        }
                    }
                }

                var result = "[" + res.join(",") + "]"
                setBuffer(uid_get(), result)

                return result
            }
        } else if (action == "scan") {
            var data = conversation.entity.text
            return importRemote(uid_get(), data)
        }
    }

    Public.handleGet = function(conversation) {
        var auth = conversation.getCookie("auth")
        if (!auth || !session_check(auth.value)) {
            return
        } else {
            setToken(auth.value)
        }

        var action = conversation.locals.get('action')
        var buffer = conversation.getCookie("buffer")

        /*
        // Set current directory id
        var current_directory = session_get("current_directory")
        if (!current_directory) {
            var current_directory = session_set("current_directory", 0)
        } else {
            if (conversation.query.get("id")) {
                session_set("current_directory", conversation.query.get("id"))
                current_directory = conversation.query.get("id")
            }
        }
        */

        // Set files sort type
        var sort = conversation.getCookie("sort")
        if (!sort) {
            var sort = conversation.createCookie("sort")

            sort.value = "name"
            sort.maxAge = -1
            sort.path = "/"
            sort.save()
        }

        //var fsMenu = session_get("fs_menu")
        current_directory = session_get("current_directory")

        if (action == "fs") {
            var id = conversation.query.get("id")
            if (!id) {
                return '[{"text": "Upload", "id": "0", "expanded": true, "hasChildren": true, "spriteCssClass": "rootfolder"}]'
            }

            return fs(uid_get(), id);
        } else if (action == "getTypesNum") {
            return getType(uid_get(), conversation.query.get("id"));
        } else if (action == "chdir") {
            // Save current_directory
            session_set("current_directory", conversation.query.get("id"))

            return getFiles(uid_get(), conversation.query.get("id"), session_get("fs_menu"), sort.value);
        } else if (action == "upload") {
            return uploadFile(uid_get(), conversation.query.get("file"), conversation.query.get("size"), conversation.query.get("extension"), current_directory);
        } else if (action == "create") {
            return addFolder(uid_get(), conversation.query.get("name"), current_directory);
        } else if (action == "remove") {
            return removeFile(uid_get(), conversation.query.get("id"));
        } else if (action == "removeFileByName") {
            return removeFileByName(uid_get(), conversation.query.get("name"), current_directory);
        } else if (action == "rmFolder") {
            return rmFolder(uid_get(), conversation.query.get("id"))
        } else if (action == "getThumb") {
            conversation.mediaTypeName = "image/png"
            return getThumb(uid_get(), conversation.query.get("name"));
        } else if (action == "buffer") {
            var buffer = getBuffer(uid_get())

            return buffer
        } else if (action == "past") {
            var buffer = getBuffer(uid_get())

            bufferPast(uid_get(), buffer, current_directory)

            setBuffer(uid_get(), "");

            return true
        } else if (action == "deleteFileFromBuffer") {
            var res = Array()
            var buffer = getBuffer(uid_get())
            var bufferArray = JSON.parse(buffer)
            for ( var key in bufferArray ) {
                if (conversation.query.get("id") != bufferArray[key].id) {
                    res[res.length] = JSON.stringify(bufferArray[key])
                }
            }

            var result = "[" + res.join(",") + "]"
            setBuffer(uid_get(), result)

            return result
        } else if (action == "clearBuffer") {
            setBuffer(uid_get(), "");

            return true
        } else if (action == "sort") {
            sort.value = conversation.query.get("type")
            sort.maxAge = -1
            sort.path = "/"
            sort.save()

            return true
        }
    }

    return Public
}())