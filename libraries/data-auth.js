importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/cryptography/')

var connection = new Mongo()
var db = connection.getDB('mediabox')

function registration(email, password) {
    var collection = db.getCollection('users')

    var query = {email: email}
    var res = BSON.from(collection.findOne(BSON.to(query)));

    if (!res) {
        var doc = BSON.to({email: email, password: org.apache.commons.codec.digest.DigestUtils.md5Hex(password)})
        collection.insert(doc)

        return true
    } else {
        return false
    }
}

function checkLogin(email, password) {
    var collection = db.getCollection('users')

    var query = {email: email, password: org.apache.commons.codec.digest.DigestUtils.md5Hex(password)}
    var res = BSON.from(collection.findOne(BSON.to(query)));

    if (res) {
        return res._id
    }
}
