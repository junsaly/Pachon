'use strict';

const clone = require('clone');
const util = require('../util.js');
const crawlers = require('../crawlers');
const { MovieInfo, SearchResult } = require('../../models/types.js');

const NAME = 'javlibrary';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

const r18 = crawlers["r18"];
const javlib = crawlers["javlibrary"];

function mixMovieInfo(d_jav, d_r18, lang) {
    if (d_r18 instanceof MovieInfo) {
        let d = clone(d_jav);
        util.syncObjects(d, d_r18);
        if (d_r18.transtitle) d.transtitle = d_r18.transtitle;
        if (d_r18.screenshots.length > 0) d.screenshots = d_r18.screenshots;
        if (lang == 'en') {
            if (d_r18.genres.length > 0) d.genres = d_r18.genres;
        }
        return d;
    }

    if (d_r18 instanceof SearchResult) {
        let jav_id = util.tryGetMovId(d_jav.title);
        let movs = d_r18.results.filter(mov => {
            let r18_id = util.tryGetMovId(mov.title);
            return jav_id == r18_id;
        });

        if (movs.length > 0) {
            let mov = movs[0];
            return r18.crawl(mov.url)
            .then(d2 => {
                if (d2) {
                    return mixMovieInfo(d_jav, d2);
                }

                return d_jav;
            })
        }
    }

    return d_jav;
}

function crawl (options) {
    let javlib = crawlers["javlibrary"];

    if (typeof options == 'string') {
        return javlib.crawl(options);
    }

    let qtext = (options.qtext || '').toLowerCase();
    let type = (options.type || '');
    let lang = (options.lang || '');

    if (!qtext || !type) {
        throw new Error('Invalid Argument');
    }
    
    return Promise.all([
        javlib.crawl({qtext: qtext, type: type, lang: lang}),
        r18.crawl({qtext: qtext, type: 'search'}),
    ])
    .then(data => {
        let d_jav = data[0];
        let d_r18 = data[1];
        
        if (d_jav instanceof SearchResult) {
            let id = util.tryGetMovId(qtext);
            let mov_id = util.tryGetMovId(d_jav.results[0].title);
            if (id == mov_id) {
                return javlib.crawl(d_jav.results[0].url)
                .then(d => {
                    if (d) {
                        return mixMovieInfo(d, d_r18, lang);
                    }
                    return d_jav;
                })
            }
            return d_jav;
        }

        if (d_jav instanceof MovieInfo) {
            return mixMovieInfo(d_jav, d_r18, lang);
        }

        return null;
    });
}

module.exports.crawl = crawl;
