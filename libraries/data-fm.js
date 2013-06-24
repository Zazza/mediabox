importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

var connection = new Mongo()
var db = connection.getDB('mediabox')

function fs(uid, id) {
    var collection = db.getCollection('fs')

    var query = {uid: uid, parent: id.toString()}
    var sort = {name: 1}
    var nodes = BSON.from(collection.find(BSON.to(query)).sort(BSON.to(sort)).toArray());

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

    var doc = {uid: uid, name: name, parent: parent, timestamp: new Date()}
    collection.insert(BSON.to(doc))
}

function getFolder(uid, id) {
    var collection = db.getCollection('fs')

    var query = {_id: {$oid: id}, uid: uid}
    var data = BSON.from(collection.findOne(BSON.to(query)));

    if (data.name.length > 20) {
        var shortname = data.name.substring(0, 10) + ".." + data.name.substring(data.name.lastIndexOf(".")-1)
    } else {
        var shortname = data.name
    }

    return '{' +
        '"id": "'+data._id+'",' +
        '"name": "'+encodeURIComponent(data.name)+'",' +
        '"shortname": "'+encodeURIComponent(shortname)+'",' +
        '"obj": "folder",' +
        '"date": "' + data.timestamp + '",' +
        '"size": "",' +
        '"ico": "'+application.globals.get('mediaTypes.folder')+'' +
        '"}';
}

function getFile(uid, id) {
    var collection = db.getCollection('files')

    var query = {_id: {$oid: id}, uid: uid}
    var data = BSON.from(collection.findOne(BSON.to(query)));

    if (data.name.length > 20) {
        var shortname = data.name.substring(0, 10) + ".." + data.name.substring(data.name.lastIndexOf(".")-1)
    } else {
        var shortname = data.name
    }

    if (application.globals.get('mediaTypes.' + data.type)) {
        var ico = application.globals.get('mediaTypes.' + data.type)
    } else {
        var ico = application.globals.get('mediaTypes.any')
    }

    var extension = data.name.substring(data.name.lastIndexOf(".")+1).toLowerCase()

    if ( (data.type != "image") && (data.type != "audio") && (data.type != "video") ) {
        var type = "all"
    } else {
        var type = data.type
    }

    return '{' +
        '"id": "'+data._id+'",' +
        '"name": "' +encodeURIComponent(data.name)+'",' +
        '"shortname": "'+encodeURIComponent(shortname)+'",' +
        '"obj": "file",' +
        '"type": "'+type+'",' +
        '"size": "'+data.size+'",' +
        '"date": "' + data.timestamp + '",' +
        '"ico": "'+ico + '",' +
        '"src": "fm/getThumb/?name='+data._id+'",' +
        '"ext": "'+extension+'' +
        '"}'
}

function getFiles(uid, id, type, sort) {
    var files = new Array();

    if (sort == "date") {
        sort = "timestamp"
    }

    if (type == "all") {
        // Get Dirs
        var collection = db.getCollection('fs')

        var query = {uid: uid, parent: id.toString()}
        var sort = {name: 1}
        var nodes = BSON.from(collection.find(BSON.to(query)).sort(BSON.to(sort)).toArray())

        for (var i = 0; i < nodes.length; i++) {
            files[files.length] = '{' +
                '"obj": "folder",' +
                '"name": "' + nodes[i]["name"] + '",' +
                '"id": "'+nodes[i]["_id"]+'",' +
                '"date": "'+nodes[i]["timestamp"]+
                '"}'
        }
    }

    // Get Files
    var collection = db.getCollection('files')

    if (type == "all") {
        var query = {uid: uid, parent: id.toString()}
    } else {
        var query = {uid: uid, parent: id.toString(), type: type}
    }
    var sort = {name: 1}
    var nodes = BSON.from(collection.find(BSON.to(query)).sort(BSON.to(sort)).toArray());

    var ico
    var type
    var shortname
    var ftype

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

        var extension = nodes[i]["name"].substring(nodes[i]["name"].lastIndexOf(".")+1).toLowerCase()

        if (nodes[i]["type"] == "image") {
            files[files.length] = '{' +
                '"id": "'+nodes[i]["_id"]+'",' +
                '"name": "' + nodes[i]["name"] + '",' +
                '"shortname": "'+shortname+'",' +
                '"obj": "file",' +
                '"type": "image",' +
                '"tab": "'+type+'",' +
                '"size": "'+nodes[i]["size"]+'",' +
                '"date": "' + nodes[i]["timestamp"] + '",' +
                '"ico": "'+ico+'",' +
                '"src": "fm/getThumb/?name='+nodes[i]["_id"]+'",' +
                '"ext": "'+extension+'' +
                '"}';
        } else {
            files[files.length] = '{' +
                '"id": "'+nodes[i]["_id"]+'",' +
                '"name": "' + nodes[i]["name"] + '",' +
                '"shortname": "'+shortname+'",' +
                '"obj": "file",' +
                '"type": "'+nodes[i]["type"]+'",' +
                '"tab": "'+type+'",' +
                '"size": "'+nodes[i]["size"]+'",' +
                '"date": "' + nodes[i]["timestamp"] + '",' +
                '"ico": "'+ico+'",' +
                '"src": "'+ico+'",' +
                '"ext": "'+extension+'"}';
        }
    }

    if (files.length > 0) {
        return "[" + files.join(",") + "]";
    } else {
        return "[]";
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

    var type = get_type(extension.toLowerCase())
    var doc = BSON.to({uid: uid, parent: id, name: filename, size: size, type: type, timestamp: new Date()})
    collection.insert(doc)

    // return json
    if (application.globals.get('mediaTypes.' + type)) {
        ico = application.globals.get('mediaTypes.' + type)
    } else {
        ico = application.globals.get('mediaTypes.any')
    }

    if (filename.length > 20) {
        shortname = filename.substring(0, 10) + ".." + filename.substring(filename.lastIndexOf(".")-1)
    } else {
        shortname = filename
    }

    if (type == "image") {
        return '{"id": "'+doc.get('_id')+'", "name": "' + filename + '", "shortname": "'+shortname+'", "obj": "file", "type": "'+type+'", "size": "'+size+'", "date": "' + new Date() + '", "ico": "'+ico+'", "src": "fm/getThumb/?name='+doc.get('_id')+'", "ext": "'+extension.toLowerCase()+'"}';
    } else {
        return '{"id": "'+doc.get('_id')+'", "name": "' + filename + '", "shortname": "'+shortname+'", "obj": "file", "type": "'+type+'", "size": "'+size+'", "date": "' + new Date() + '", "ico": "'+ico+'", "src": "'+ico+'", "ext": "'+extension.toLowerCase()+'"}';
    }
}

function uploadThumb(id, data) {
    var collection = db.getCollection('files')

    var update = {$push: {data: { $binary: data }}}

    collection.update(BSON.to({_id: {$oid: id}}), BSON.to(update), false, false)

    return true;
}

function getThumb(uid, filename) {
    var collection = db.getCollection('files')

    var query = {uid: uid, _id: {$oid: filename}}
    var file = BSON.from(collection.findOne(BSON.to(query)));

    var b = org.bson.types.Binary(file.data[0]);
    return b.data
}

function getType(uid, id) {
    var collection = db.getCollection('files')

    var query = {uid: uid, parent: id.toString()}
    var files = BSON.from(collection.find(BSON.to(query)).toArray());

    var type = new Array()

    type["all"] = 0
    type["image"] = 0
    type["video"] = 0
    type["audio"] = 0

    for (var i = 0; i < files.length; i++) {
        if (typeof(files[i]["type"]) == "string") {
            if (files[i]["type"] == "image") {
                type["image"]++
            }
            if (files[i]["type"] == "video") {
                type["video"]++
            }
            if (files[i]["type"] == "audio") {
                type["audio"]++
            }

            type["all"]++;
        }
    }

    return '{"all": "'+type["all"]+'", "image": "'+type["image"]+'", "video": "'+type["video"]+'", "audio": "'+type["audio"]+'"}';
}

function removeFile(uid, id) {
    var collection = db.getCollection('files')

    var query = {uid: uid, _id: {$oid: id}}

    BSON.from(collection.remove(BSON.to(query)));

    return true
}

function removeFileByName(uid, filename, parent_id) {
    var collection = db.getCollection('files')

    var query = {uid: uid, parent: parent_id.toString(), name: filename}

    var res = BSON.from(collection.findOne(BSON.to(query)))
    BSON.from(collection.remove(BSON.to(query)));

    return res._id
}

function rmFolder(uid, id) {
    var collection = db.getCollection('fs')

    var query = {uid: uid, _id: {$oid: id}}
    BSON.from(collection.remove(BSON.to(query)));

    return true
}

function bufferExist(buffer, id) {
    if (buffer) {
        var bufferArray = JSON.parse(buffer)
        for ( var key in bufferArray ) {
            if  (bufferArray[key].id == id) {
                return true
            }
        }
    }

    return false
}

function bufferPast(uid, buffer, parent) {
    var bufferArray = JSON.parse(buffer)

    var collection_files = db.getCollection('files')
    var collection_folders = db.getCollection('fs')

    for ( var key in bufferArray ) {
        if (bufferArray[key].obj == "file") {
            var update = {$set: {parent: parent}}
            collection_files.update(BSON.to({_id: {$oid: bufferArray[key].id}}), BSON.to(update), false, false)
        } else if (bufferArray[key].obj == "folder") {
            var update = {$set: {parent: parent}}
            collection_folders.update(BSON.to({_id: {$oid: bufferArray[key].id}}), BSON.to(update), false, false)
        }
    }
}

function getFolderId_fullname(uid, fullname) {
    var collection = db.getCollection('fs')

    var query = {fullname: fullname, uid: uid}
    var data = BSON.from(collection.findOne(BSON.to(query)));

    return data._id;
}

function importRemote(uid, data) {
    var res = Array()
    var data = JSON.parse(data)
    var tmp

    for (var i=0; i<data.length; i++) {

        if (data[i]["obj"] == "file") {
            if (data[i]["level"] == 0) {
                var parent = 0
            } else {
                var parent = getFolderId_fullname(uid, data[i]["parent"]).toString()
            }

            var collection = db.getCollection('files')
            var type = get_type(data[i]["extension"].toLowerCase())
            var doc = BSON.to({uid: uid, parent: parent, name: data[i]["name"], size: data[i]["size"], type: type, timestamp: new Date()})
            collection.insert(doc)

            //tmp = uploadFile(uid, data[i]["name"], data[i]["size"], data[i]["extension"], parent)
            if (data[i]["thumb"]) {
                uploadThumb(doc.get('_id'), data[i]["thumb"])
            }

            res[res.length] = '{"id": "' + doc.get('_id') + '", "obj": "file", "fullname": "' + data[i]["parent"] + "/" + data[i]["name"] + '"}'

        } else if (data[i]["obj"] == "folder") {
            if (data[i]["level"] == 0) {
                var parent = "0"
            } else {
                var parent = getFolderId_fullname(uid, data[i]["parent"]).toString()
            }
            //addFolder(uid, data[i]["name"], parent)
            var collection = db.getCollection('fs')

            var doc = BSON.to({uid: uid, name: data[i]["name"], fullname: data[i]["parent"] + "/" + data[i]["name"], parent: parent, timestamp: new Date()})
            collection.insert(doc)

            //res[res.length] = '{id:' + doc.get('_id') + ', obj: "folder", fullname: ' + data[i]["parent"] + "/" + data[i]["name"] + '}'
        }
    }

    return "[" + res.join(",") + "]";
}