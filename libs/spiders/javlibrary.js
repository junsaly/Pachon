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

const javlib = crawlers["javlibrary"];

function mixMovieInfo(d_jav, d_r18) {
    if (d_r18 instanceof MovieInfo) {
        let d = clone(d_jav);
        util.syncObjects(d, d_r18);
        if (d_r18.transtitle) d.transtitle = d_r18.transtitle;
        if (d_r18.screenshots.length > 0) d.screenshots = d_r18.screenshots;
        d.genres = d_r18.genres;
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
        javlib.crawl({qtext: qtext, type: type, lang: "ja"}),
        javlib.crawl({qtext: qtext, type: type, lang: "en"}),
    ])
    .then(data => {
        let d_0 = data[0];
        let d_1 = data[1];
        
        if (d_0 instanceof SearchResult) {
            let id = util.tryGetMovId(qtext);
            let mov_id = util.tryGetMovId(d_0.results[0].title);
            if (id == mov_id) {
                return Promise.all([
                    javlib.crawl(d_0.results[0].url),
                    javlib.crawl(d_1.results[0].url),
                ]).then(d => {
                    if (d[1]) {
                        let data = util.syncObjects(d[0], d[1]);
                        data.genres = d[1].genres;
                        return data;
                    }

                    return d[0];
                })
            }

            return d_0;
        }

        if (d_0 instanceof MovieInfo) {
            let data = util.syncObjects(d_0, d_1);
            data.genres = d_1.genres;
            return data;
        }

        return null;
    });
}

module.exports.crawl = crawl;
