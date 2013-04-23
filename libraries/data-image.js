importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

var connection = new Mongo()
var db = connection.getDB('mediabox')

function setCrop(_id, description, ws, x1, x2, y1, y2) {
    var collection = db.getCollection('crop')

    var doc = BSON.to({image_id: _id, description: description, ws: ws, x1: x1, x2: x2, y1: y1, y2: y2})
    collection.insert(doc)

    return true
}

function getCrops(id) {
    var collection = db.getCollection('crop')

    var query = {image_id: id}
    var crops = BSON.from(collection.find(BSON.to(query)).toArray());

    var res = new Array()

    for (var i = 0; i < crops.length; i++) {
        res[i] = '{"x1": "'+crops[i]["x1"]+'", "x2": "'+crops[i]["x2"]+'", "y1": "'+crops[i]["y1"]+'", "y2": "'+crops[i]["y2"]+'", "ws": "'+crops[i]["ws"]+'", "description": "'+crops[i]["description"]+'"}'
    }

    return "[" + res.join(",") + "]";
}

function addTag(_id, tag) {
    var collection = db.getCollection('image-tags')

    var doc = BSON.to({image_id: _id, tag: tag})
    collection.insert(doc)

    return true
}

function getTags(id) {
    var collection = db.getCollection('image-tags')

    var query = {image_id: id.toString()}
    var tags = BSON.from(collection.find(BSON.to(query)).toArray());

    var res = new Array()

    for (var i = 0; i < tags.length; i++) {
        res[i] = '{"tag": "'+tags[i]["tag"]+'"}'
    }

    return "[" + res.join(",") + "]";
}

function addComment(_id, text) {
    var collection = db.getCollection('image-comments')

    var timestamp = new Date();

    var doc = BSON.to({image_id: _id, timestamp: timestamp, text: decodeURIComponent(text)})
    collection.insert(doc)

    return true
}

function getComments(id) {
    var collection = db.getCollection('image-comments')

    var query = {image_id: id.toString()}
    var comments = BSON.from(collection.find(BSON.to(query)).toArray());

    var res = new Array()

    for (var i = 0; i < comments.length; i++) {
        res[i] = '{"text": "'+encodeURIComponent(comments[i]["text"])+'", "timestamp": "'+comments[i]["timestamp"]+'"}'
    }

    return "[" + res.join(",") + "]";
}