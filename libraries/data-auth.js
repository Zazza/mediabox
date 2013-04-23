importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/cryptography/')

var connection = new Mongo()
var db = connection.getDB('mediabox')

/**
 * UID after session_check
 */
var _uid

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

function session_start(id, limit) {
    var collection = db.getCollection('session')

    var query = {uid: id}
    var res = BSON.from(collection.findOne(BSON.to(query)))

    if (!res) {
        var timestamp = new Date();
        var token = org.apache.commons.codec.digest.DigestUtils.md5Hex(id + timestamp)
        var doc = BSON.to({uid: id, token: token, created: timestamp, updated: timestamp, timelimit: limit})
        collection.insert(doc)

        return token
    } else {
        BSON.from(collection.remove(BSON.to(query)));
    }
}

function session_check(token) {
    var collection = db.getCollection('session')

    var query = {token: token}
    var res = BSON.from(collection.findOne(BSON.to(query)))

    if (res) {
        _uid = res.uid

        var timestamp = new Date();
        var period = (timestamp.getTime() - res.updated.getTime()) / 1000;

        if (res.timelimit > period) {
            var update = {$set: {updated: timestamp}}
            collection.update(BSON.to({token: token}), BSON.to(update), false, false)

            return true
        } else {
            BSON.from(collection.remove(BSON.to(query)));

            return false
        }
    }
}

function uid_get() {
    return _uid
}

function session_delete(token) {
    var collection = db.getCollection('session')

    var query = {token: token}

    BSON.from(collection.remove(BSON.to(query)));
}