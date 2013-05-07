importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

var connection = new Mongo()
var db = connection.getDB('mediabox')

function fs(uid, id) {
    var collection = db.getCollection('fs')

    var query = {uid: uid, parent: id.toString()}
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

function addFolder(uid, name, parent) {
    var collection = db.getCollection('fs')

    var doc = {uid: uid, name: name, parent: parent}
    collection.insert(BSON.to(doc))
}

function getFile(uid, id) {
    var collection = db.getCollection('files')

    var query = {_id: {$oid: id}, uid: uid}
    return BSON.from(collection.findOne(BSON.to(query)));
}

function getFiles(uid, id) {
    var files = new Array();

    // Get Dirs
    var collection = db.getCollection('fs')

    var query = {uid: uid, parent: id.toString()}
    var nodes = BSON.from(collection.find(BSON.to(query)).toArray());

    var num_file = nodes.length;

    for (var i = 0; i < nodes.length; i++) {
        files[i] = '{"name": "' + nodes[i]["name"] + '", "id": "'+nodes[i]["_id"]+'", "obj": "folder"}';
    }

    // Get Files
    var collection = db.getCollection('files')

    var query = {uid: uid, parent: id.toString()}
    var nodes = BSON.from(collection.find(BSON.to(query)).toArray());

    var ico
    var type
    var shortname
    for (var i = 0; i < nodes.length; i++) {
        shortname = "";

        if (application.globals.get('mediaTypes.' + nodes[i]["type"])) {
            ico = application.globals.get('mediaTypes.' + nodes[i]["type"])
        } else {
            ico = application.globals.get('mediaTypes.any')
        }

        if (nodes[i]["name"].length > 20) {
            shortname = nodes[i]["name"].substring(0, 10) + ".." + nodes[i]["name"].substring(nodes[i]["name"].lastIndexOf(".")-1)
        } else {
            shortname = nodes[i]["name"]
        }

        var extension = nodes[i]["name"].substring(nodes[i]["name"].lastIndexOf(".")+1)

        files[num_file + i] = '{"id": "'+nodes[i]["_id"]+'", "name": "' + nodes[i]["name"] + '", "shortname": "'+shortname+'", "obj": "file", "type": "'+nodes[i]["type"]+'", "size": "'+nodes[i]["size"]+'", "type": "'+nodes[i]["type"]+'", "ico": "'+ico+'", "data": "'+ico+'", "ext": "'+extension+'"}';
    }

    if (files.length > 0) {
        return "[" + files.join(",") + "," + getType(uid, id) + "]";
    } else {
        return "[" + getType(uid, id) + "]";
    }
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

function uploadFile(uid, filename, size, extension, id) {
    var collection = db.getCollection('files')

    var type = get_type(extension)
    var doc = BSON.to({uid: uid, parent: id, name: filename, size: size, type: type})
    collection.insert(doc)

    return '{"_id": "' + doc.get('_id') + '", "type": "'+type+'"}'
}

function uploadThumb(id, data) {
    var collection = db.getCollection('files')

    var update = {$push: {data: data}}

    collection.update(BSON.to({_id: {$oid: id}}), BSON.to(update), false, false)

    return true;
}

function getThumb(uid, filename) {
    var collection = db.getCollection('files')

    var query = {uid: uid, _id: {$oid: filename}}
    var file = BSON.from(collection.findOne(BSON.to(query)));

    return file.data.toString()
}

function getType(uid, id) {
    var collection = db.getCollection('files')

    var query = {uid: uid, parent: id.toString()}
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

    return '{"obj": "type", "all": "'+type["all"]+'", "image": "'+type["image"]+'", "video": "'+type["video"]+'", "music": "'+type["music"]+'"}';
}

function removeFile(uid, filename, parent_id) {
    var collection = db.getCollection('files')

    var query = {uid: uid, parent: parent_id.toString(), name: filename}

    var res = BSON.from(collection.findOne(BSON.to(query)))
    BSON.from(collection.remove(BSON.to(query)));

    return '{"_id": "' + res._id + '"}'
}

function bufferExist(buffer, id) {
    var bufferArray = JSON.parse(buffer)
    for ( var key in bufferArray ) {
        if  (bufferArray[key]._id == id) {
            return true
        }
    }

    return false
}

function bufferPast(uid, buffer, parent) {
    var bufferArray = JSON.parse(buffer)

    var collection = db.getCollection('files')

    for ( var key in bufferArray ) {
        var update = {$set: {parent: parent}}

        collection.update(BSON.to({_id: {$oid: bufferArray[key]._id}}), BSON.to(update), false, false)
    }
}

function rmFolder(uid, name, parent) {
    var collection = db.getCollection('fs')

    var query = {uid: uid, parent: parent, name: name}
    return BSON.from(collection.remove(BSON.to(query)));
}