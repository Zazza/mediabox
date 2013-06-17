importClass(com.mongodb.Mongo, com.mongodb.rhino.BSON)

document.executeOnce('/sincerity/cryptography/')

var connection = new Mongo()
var db = connection.getDB('mediabox')

/**
 * UID after session_check
 */
var _uid

var _token

function uid_get() {
    return _uid
}

function setToken(token) {
    _token = token
}

function session_start(id, limit) {
    var collection = db.getCollection('session')

    var query = {uid: id}
    var res = BSON.from(collection.findOne(BSON.to(query)))

    if (res) {
        BSON.from(collection.remove(BSON.to(query)));
    }

    var timestamp = new Date();
    var token = org.apache.commons.codec.digest.DigestUtils.md5Hex(id + timestamp)
    var doc = BSON.to({uid: id, token: token, created: timestamp, updated: timestamp, timelimit: limit})
    collection.insert(doc)

    return token
}

function session_check(token) {
    var collection = db.getCollection('session')

    var query = {token: token}
    var res = BSON.from(collection.findOne(BSON.to(query)))

    if (res) {
        _uid = res.uid
        _token = token

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

function session_delete(token) {
    var collection = db.getCollection('session')

    var query = {token: token}

    BSON.from(collection.remove(BSON.to(query)));
}

function session_get(key) {
    var collection = db.getCollection('session')

    var query = {token: _token}
    var res = BSON.from(collection.findOne(BSON.to(query)))

    if (key in res)
        return res[key]

    return false
}

function session_set(key, value) {
    var data = {}
    data[key] = value

    var collection = db.getCollection('session')
/*
    var query = {token: _token}
    var res = BSON.from(collection.findOne(BSON.to(query)))
    if (res.data)
        data = JSON.parse(res.data) + data
*/
    var update = {$set: data}
    collection.update(BSON.to({token: _token}), BSON.to(update), false, false)

    return true
}
