importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/classes/')
document.executeOnce('/sincerity/templates/')
document.executeOnce('/data/')

FmResource = Sincerity.Classes.define(function() {

    var Public = {}

    Public.handleInit = function(conversation) {
        conversation.addMediaTypeByName('text/html')
        conversation.addMediaTypeByName('text/plain')
    }

    Public.handleGet = function(conversation) {
        var action = conversation.locals.get('action')

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
        var theme = conversation.getCookie("theme");
        var fsMenu = conversation.getCookie("fs_menu");

        if (action == "fs") {
            var id = conversation.query.get("id")
            if (!id) {
                return '[{"text": "Upload", "id": "0", "expanded": true, "hasChildren": true, "spriteCssClass": "rootfolder"}]'
            }

            return fs(id);
        } else if (action == "chdir") {
            if (!current_directory) {
                current_directory = conversation.createCookie("current_directory")
                current_directory.value = conversation.query.get("id")
                current_directory.maxAge = -1
                current_directory.path = "/"
                current_directory.save()
            } else {
                current_directory.value = conversation.query.get("id")
      //          current_directory.remove()
                current_directory.maxAge = -1
                current_directory.path = "/"
                current_directory.save()
            }

            return getFiles(conversation.query.get("id"));
        } else if (action == "upload") {
            return uploadFile(conversation.query.get("file"), conversation.query.get("size"), conversation.query.get("extension"), current_directory.value);
        } else if (action == "create") {
            return addFolder(conversation.query.get("name"), current_directory.value);
        } else if (action == "remove") {
            return removeFile(conversation.query.get("file"), current_directory.value);
        } else if (action == "theme") {
            if (!theme) {
                theme = conversation.createCookie("theme")
                theme.value = conversation.query.get("theme")
                theme.maxAge = -1
                theme.path = "/"
                theme.save()
            } else {
                theme.value = conversation.query.get("theme")
                theme.maxAge = -1
                theme.path = "/"
                theme.save()
            }

            return true;
        } else if (action == "getIco") {
            return getIco(conversation.query.get("id"));
        } else if (action == "fsMenu") {
            if (!fsMenu) {
                fsMenu = conversation.createCookie("fs_menu")
                fsMenu.value = conversation.query.get("tab")
                fsMenu.maxAge = -1
                fsMenu.path = "/"
                fsMenu.save()
            } else {
                fsMenu.value = conversation.query.get("tab")
                fsMenu.maxAge = -1
                fsMenu.path = "/"
                fsMenu.save()
            }

            return true;
        }
    }

    return Public
}())