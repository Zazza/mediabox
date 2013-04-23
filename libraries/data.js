importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/cryptography/')

var connection = new Mongo()
var db = connection.getDB('mediabox')

function fs(id) {
    var collection = db.getCollection('fs')

    var query = {parent: id.toString()}
    var nodes = BSON.from(collection.find(BSON.to(query)).toArray());

    var tree = new Array();

    for (var i = 0; i < nodes.length; i++) {
        tree[i] = '{"text": "' + nodes[i]["name"] + '", "id": "'+nodes[i]["_id"]+'", "hasChildren": '+hasChildren(nodes[i]["_id"])+', "spriteCssClass": "folder"}';
    }

    return "[" + tree.join(",") + "]";
}

function hasChildren(id) {
    var collection = db.getCollection('fs')

    var doc = {parent: id.toString()}
    var count = collection.count(BSON.to(doc))

    if (count == 0) {
        return false
    } else {
        return true
    }
}

function addFolder(name, parent) {
    var collection = db.getCollection('fs')

    var doc = {name: name, parent: parent}
    collection.insert(BSON.to(doc))
}

function getFiles(id) {
    var files = new Array();

    // Get Dirs
    var collection = db.getCollection('fs')

    var query = {parent: id.toString()}
    var nodes = BSON.from(collection.find(BSON.to(query)).toArray());

    var num_file = nodes.length;

    for (var i = 0; i < nodes.length; i++) {
        files[i] = '{"name": "' + nodes[i]["name"] + '", "id": "'+nodes[i]["_id"]+'", "obj": "folder"}';
    }

    // Get Files
    var collection = db.getCollection('files')

    var query = {parent: id.toString()}
    var nodes = BSON.from(collection.find(BSON.to(query)).toArray());

    var ico
    var type
    var shortname
    for (var i = 0; i < nodes.length; i++) {
        shortname = "";

        if (application.globals.get('mediaTypes.' + type)) {
            ico = application.globals.get('mediaTypes.' + type)
        } else {
            ico = application.globals.get('mediaTypes.any')
        }

        if (nodes[i]["name"].length > 20) {
            shortname = nodes[i]["name"].substring(0, 10) + ".." + nodes[i]["name"].substring(nodes[i]["name"].lastIndexOf(".")-1)
        } else {
            shortname = nodes[i]["name"]
        }

        if (nodes[i]["data"]) {
            files[num_file + i] = '{"id": "'+nodes[i]["_id"]+'", "name": "' + nodes[i]["name"] + '", "shortname": "'+shortname+'", "obj": "file", "type": "'+nodes[i]["type"]+'", "size": "'+nodes[i]["size"]+'", "type": "'+nodes[i]["type"]+'", "ico": "'+ico+'", "data": "'+nodes[i]["data"]+'"}';
            //files[num_file + i] = '{"id": "'+nodes[i]["_id"]+'", "name": "' + nodes[i]["name"] + '", "obj": "file", "type": "'+nodes[i]["type"]+'", "size": "'+nodes[i]["size"]+'", "type": "'+nodes[i]["type"]+'", "ico": "'+ico+'", "data": "' + getIco(nodes[i]["_id"]) + '"}';
        } else {
            files[num_file + i] = '{"id": "'+nodes[i]["_id"]+'", "name": "' + nodes[i]["name"] + '", "shortname": "'+shortname+'", "obj": "file", "type": "'+nodes[i]["type"]+'", "size": "'+nodes[i]["size"]+'", "type": "'+nodes[i]["type"]+'", "ico": "'+ico+'", "data": "'+ico+'"}';
        }
    }

    return "[" + files.join(",") + "]";
}

function getIco(id) {
    // Get Dirs
    var collection = db.getCollection('files')

    var query = {_id: {$oid: id}}
    var file = BSON.from(collection.findOne(BSON.to(query)));

    var ico
    var res

    if (application.globals.get('mediaTypes.' + file.type)) {
        ico = application.globals.get('mediaTypes.' + file.type)
    } else {
        ico = application.globals.get('mediaTypes.any')
    }

    if (file.data) {
        res = file.data.toString()
    } else {
        res = ico
    }

    return res
}

function in_array(needle, haystack, strict) {
    var found = false, key, strict = !!strict;

    for (key in haystack) {
        if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
            found = true;
            break;
        }
    }

    return found;
}

function get_type(extension) {
    var config = application.globals.get("extension")
    for (var key in config) {
        if (in_array(extension, config[key])) {
            return config[key][0]
        }
    }

    return 'unknown'
}

function uploadFile(filename, size, extension, id) {
    var collection = db.getCollection('files')

    var type = get_type(extension)
    var doc = BSON.to({parent: id, name: filename, size: size, type: type})
    collection.insert(doc)

    return '{"_id": "' + doc.get('_id') + '", "type": "'+type+'"}'
}

function uploadThumb(id, data) {
    var collection = db.getCollection('files')

    var update = {$push: {data:  data}}
    collection.update(BSON.to({_id: {$oid: id}}), BSON.to(update), false, false)

    return true;
}

function getType(id) {
    var current_directory = conversation.getCookie("current_directory");
    if (current_directory) {
        var parent_id = current_directory.value;
    } else {
        var parent_id = 0;
    }

    var collection = db.getCollection('files')

    var query = {parent: parent_id.toString()}
    var files = BSON.from(collection.find(BSON.to(query)).toArray());

    var type = new Array()

    type["all"] = 0
    type["image"] = 0
    type["video"] = 0
    type["music"] = 0

    for (var i = 0; i < files.length; i++) {
        if (typeof(files[i]["type"]) == "string") {
            if (files[i]["type"] == "image") {
                type["image"]++
            }
            if (files[i]["type"] == "video") {
                type["video"]++
            }
            if (files[i]["type"] == "audio") {
                type["music"]++
            }

            type["all"]++;
        }
    }

    return type;
}

function removeFile(filename, parent_id) {
    var collection = db.getCollection('files')

    var query = {parent: parent_id.toString(), name: filename}

    var res = BSON.from(collection.findOne(BSON.to(query)))
    BSON.from(collection.remove(BSON.to(query)));

    return '{"_id": "' + res._id + '"}'
}