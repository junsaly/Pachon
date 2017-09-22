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

function mixMovieInfo(d_jav, d_r18, lang) {
    if (d_r18 instanceof MovieInfo) {
        let d = clone(d_jav);
        d.transtitle = d_r18.transtitle;
        d.screenshots = d_r18.screenshots;
        if (d.actors.length == 0) d.actors = d_r18.actors;
        if (d.posters.length == 0) d.posters = d_r18.posters;
        if (!d.director) d.director = d_r18.director;
        if (!d.label) d.label = d_r18.label;
        if (!d.maker) d.maker = d_r18.maker;
        if (!d.duration) d.duration = d_r18.duration;
        if (!d.year) d.year = d_r18.year;
        if (lang == 'en') {
            if (d_r18.genres.length > 0) {
                for (var genre of d_r18.genres) {
                    if (d.genres.some(v => v.text == genre.text)) {
                        continue;
                    }

                    d.genres.push(genre);
                }
            }
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
            let r18 = crawlers["r18"];
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
    
    let r18 = crawlers["r18"];

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
