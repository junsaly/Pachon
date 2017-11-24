'use strict';

const storage = require('./storage.js');

var NodeCache = require('node-cache');
var cache = new NodeCache( { stdTTL: 60, checkperiod: 20 } );

cache.on("set", function( key, value ){
    console.log('Set: [' + key + '] ' + JSON.stringify(value));
});

// cache.on("del", function (key, value) {
//     console.log('Del: [' + key + '] ' + value);
// });

cache.on("expired", function( key, value ){
    console.log('Expired: [' + key + '] ');
    let [ typ, ky ] = parseKey(key);
    console.log(parseKey(key));
    if (typ == 'data-id') {
        // write to disk
        storage.writeJson('records', ky + '.json', value);
    }
});

function getKey (type, key) {

    if (typeof type !== 'string' || typeof key !== 'string') {
        throw new Error('Invalid argument type');
    }

    let typ = (type || "").trim();
    let ky = (key || "").trim();

    if (typ === "" || ky === "") {
        throw new Error('Invalid argument values');
    }

    return `[${typ}]${ky}`;
}

function parseKey (value) {
    let p = value.indexOf(']');
    let type = value.substring(1, p);
    let key = value.substring(p+1);
    return [ type, key ];
}

function set (type, key, val, ttl) {
    let storeKey = getKey(type, key);
    if (cache.get(storeKey)) {
        return true;
    }
    return cache.set(storeKey, val, ttl);
}

module.exports.set = set;

function get (type, key) {
    let storeKey = getKey(type, key);
    return cache.get(storeKey);
}

module.exports.get = get;
