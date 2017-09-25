'use strict';

const clone = require('clone');
const util = require('../util.js');
const crawlers = require('../crawlers');

const NAME = 'tokyo-hot';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

const crawler = crawlers["tokyo-hot"];

function thenIfSearch (opt) {
    return crawler.crawl(Object.assign({}, opt, {lang: 'ja'}))
    .then(result => {
        if (result.results.length == 1) {
            let mov = result.results[0];
            let footprint = result.getFootprint(mov);
            let movid = footprint.id;
            return thenIfID(Object.assign({}, opt, {type: 'id', qtext: movid}));
        }
        return result;
    })
}

function thenIfID (opt) {
    return Promise.all([
        crawler.crawl(Object.assign({}, opt, {lang: 'ja'})),
        crawler.crawl(Object.assign({}, opt, {lang: 'en'})),
    ])
    .then(data => {
        let d, d1, d2;
        d1 = data[0];
        d2 = data[1];
        if (d1) {
            d = clone(d1);
            if (d2) {
                util.syncObjects(d, d2);
                if (d2.description) d.description = d2.description;
                if (d2.genres.length > 0) d.genres = d2.genres;
            }
            return d;
        }
        return clone(d2);
    });
}

function crawl (opt) {
    switch(opt.type) {
        case 'search':
            return thenIfSearch(opt);
        case 'id':
            return thenIfID(opt);
        default:
            return Promise.reject(new Error('Invalid opt.type'));
    }
}

module.exports.crawl = crawl;
