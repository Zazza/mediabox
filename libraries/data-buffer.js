importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

var connection = new Mongo()
var db = connection.getDB('mediabox')


function getBuffer(uid) {
    var collection = db.getCollection('buffer')

    var query = {uid: uid}
    var data = BSON.from(collection.findOne(BSON.to(query)));

    if (data)
        return data.data
}

function setBuffer(uid, data) {
    var collection = db.getCollection('buffer')

    var query = {uid: uid}
    BSON.from(collection.remove(BSON.to(query)));

    var doc = BSON.to({uid: uid, data: data})
    collection.insert(doc)

    return true
}