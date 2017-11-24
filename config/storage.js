'use strict';

const config = require('../config.js');
const path = require('path');
const fs = require('fs-extra');
const fileRoot = config['file-root'];
const typeMap = {
    'root': fileRoot,
    '/': fileRoot,
};

module.exports.init = function (options) {
    fs.ensureDirSync(fileRoot);
    if (options.dirs) {
        options.dirs.forEach(dir => {
            let dirPath = path.join(fileRoot, dir);
            fs.ensureDirSync(dirPath);
            typeMap[dir] = dirPath;
        })
    }
}

function getPath (type, filename) {
    let typePath = typeMap[type];
    if (type) {
        return path.join(typePath, filename);
    }
    throw new Error('Invalid config: no type had found');
}

module.exports.createWritestream = function (type, filename) {
    try {
        let filepath = getPath(type, filename);
        return fs.createWriteStream(filepath);
    } catch (ex) {
        throw ex;
    }
}

module.exports.writeJson = function (type, filename, data) {
    try {
        let filepath = getPath(type, filename);
        fs.writeJson(filepath, data, err => {
            if (err) console.error(err);
        });
    } catch (ex) {
        throw ex;
    }
}
