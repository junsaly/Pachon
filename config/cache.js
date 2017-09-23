'use strict';

var NodeCache = require('node-cache');
var cache = new NodeCache( { stdTTL: 60, checkperiod: 20 } );

cache.on("set", function( key, value ){
    console.log('Set: [' + key + '] ' + value);
});

// cache.on("del", function (key, value) {
//     console.log('Del: [' + key + '] ' + value);
// });

cache.on("expired", function( key, value ){
    console.log('Expired: [' + key + '] ' + value);
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

    return '[' + typ + ']' + ky;
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
