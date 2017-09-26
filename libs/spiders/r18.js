'use strict';

const clone = require('clone');
const util = require('../util.js');
const crawlers = require('../crawlers');
const { MovieInfo, SearchResult } = require('../../models/types.js');

const NAME = 'r18';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

const r18 = crawlers["r18"];
const javlib = crawlers["javlibrary"];

function mixMovieInfo(d_r18, d_jav) {
    if (d_jav instanceof MovieInfo) {
        let d = clone(d_r18);
        util.syncObjects(d, d_jav);
        if (d_jav.actors.length > 0) d.actors = d_jav.actors;
        if (d_jav.director) d.director = d_jav.director;
        if (d_jav.label) d.label = d_jav.label;
        if (d_jav.maker) d.maker = d_jav.maker;
        return d;
    }

    if (d_jav instanceof SearchResult) {
        let mov = d_jav.results[0];
        if (d_r18.title == mov.title) {
            return javlib.crawl(mov.url)
            .then(d2 => {
                if (d2) {
                    return mixMovieInfo(d_r18, d2);
                }
                
                return d_r18;
            });
        }
    }

    d_r18.origtitle = d_r18.transtitle;
    d_r18.transtitle = '';
    return d_r18;
}

function crawl (options) {
    if (typeof options == 'string') {
        return r18.crawl(options);
    }

    let qtext = (options.qtext || '').toLowerCase();
    let type = (options.type || '');

    if (!qtext || !type) {
        throw new Error('Invalid Argument');
    }
    
    return Promise.all([
        r18.crawl({qtext: qtext, type: type}),
        javlib.crawl({qtext: util.tryGetMovId(qtext), type: 'search', lang: 'ja'}),
    ])
    .then(data => {
        let d_r18 = data[0];
        let d_jav = data[1];
        if (d_r18 instanceof SearchResult) {
            return d_r18;
        }

        if (d_r18 instanceof MovieInfo) {
            return mixMovieInfo(d_r18, d_jav);
        }

        return null;
    });
}

module.exports.crawl = crawl;
