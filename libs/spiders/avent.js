'use strict';

const clone = require('clone');
const util = require('../util.js');
const crawlers = require('../crawlers');
const { MovieInfo, SearchResult } = require('../../models/types.js');

const NAME = 'avent';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

const avent = crawlers["avent"];

function crawl (options) {
    if (typeof options == 'string') {
        return r18.crawl(options);
    }

    let qtext = (options.qtext || '').toLowerCase();
    let type = (options.type || '');

    if (!qtext || !type) {
        throw new Error('Invalid Argument');
    }
    
    if (!('lang' in options)) {
        options.lang = 'en';
    }

    return avent.crawl(options)
    .then(d => {
        if (d instanceof SearchResult) {
            return d;
        }

        if (d instanceof MovieInfo) {
            let lang = options.lang;
            if (lang == 'en') {
                return avent.crawl(
                    Object.assign({}, options, {lang: 'ja'})
                ).then(d2 => {
                    if (d2) {
                        util.syncObjects(d, d2);
                        if (d2.actors.length > 0) d.actors = d2.actors;
                        if (d2.maker) d.maker = d2.maker;
                    }
                    return d;
                })
            }
            if (lang == 'ja') {
                return avent.crawl(
                    Object.assign({}, options, {lang: 'en'})
                ).then(d2 => {
                    if (d2) {
                        util.syncObjects(d, d2);
                        if (d2.genres.length > 0) d.genre = d2.genres;
                    }
                    return d;
                })
            }
        }

        return d;
    });
}

module.exports.crawl = crawl;
