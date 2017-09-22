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

function mixMovieInfo(d_r18, d_jav) {
    if (d_jav instanceof MovieInfo) {
        let d = clone(d_r18);
        if (d.actors.length == 0) d.actors = d_jav.actors;
        if (d.genres.length == 0) d.genres = d_jav.genres;
        if (d.posters.length == 0) d.posters = d_jav.posters;
        if (!d.director) d.director = d_jav.director;
        if (!d.label) d.label = d_jav.label;
        if (!d.maker) d.maker = d_jav.maker;
        return d;
    }

    if (d_jav instanceof SearchResult) {
        let mov = d_jav.results[0];
        if (d_r18.title == mov.title) {
            let javlib = crawlers["javlibrary"];
            return javlib.crawl(mov.url)
            .then(d2 => {
                if (d2) {
                    return mixMovieInfo(d_r18, d2);
                }
                
                return d_r18;
            });
        }
    }

    return d_r18;
}

function crawl (options) {
    let r18 = crawlers["r18"];

    if (typeof options == 'string') {
        return r18.crawl(options);
    }

    let qtext = (options.qtext || '').toLowerCase();
    let type = (options.type || '');

    if (!qtext || !type) {
        throw new Error('Invalid Argument');
    }
    
    let javlib = crawlers["javlibrary"];

    return Promise.all([
        r18.crawl({qtext: qtext, type: type}),
        javlib.crawl({qtext: util.tryGetMovId(qtext), type: 'search', lang: 'en'}),
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
