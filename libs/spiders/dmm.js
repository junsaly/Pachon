'use strict';

const clone = require('clone');
const util = require('../util.js');
const crawlers = require('../crawlers');
const { MovieInfo, SearchResult } = require('../../models/types.js');

const NAME = 'dmm';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

const dmm = crawlers['dmm'];
const javlib = require('./javlibrary.js');

function mixMovieInfo (des, src) {
    if (src.title) des.title = src.title;
    if (src.transtitle) des.transtitle = src.transtitle;
    if (src.genres.length > 0) des.genres = src.genres;
    if (src.actors.length > 0 && des.actors.length == 0) des.actors = src.actors;
    if (src.screenshots.length > 0 && des.screenshots.length == 0) des.screenshots = src.screenshots;
    return des;
}

function crawlByUrl (url, movid) {
    return Promise.all([
        dmm.crawl(url),
        javlib.crawl({
            qtext: movid,
            type: 'search',
            lang: 'en',
        }),
    ])
    .then(d2 => {
        let d21 = d2[0];
        let d22 = d2[1];

        if (d22 instanceof MovieInfo) {
            let d = clone(d21);
            mixMovieInfo(d, d22);
            return d;
        }

        return d21;
    });
}

function thenIfSearch (d1, opt) {
    let movid = util.tryGetMovId(opt.qtext);
    let df = d1.results.filter(
        v => util.tryGetMovId(v.title) == movid &&
             v.url.indexOf('www.dmm.co.jp/mono/dvd/') > -1);

    if (df.length == 0) {
        let d = clone(d1);
        df = d1.results.filter(
            v => v.url.indexOf('www.dmm.co.jp/mono/dvd/') > -1
        );
        d.results = df;
        d.results.reverse();
        return d;

    } else if (df.length > 1) {
        let movids = {};
        df.forEach(v => {
            movids[util.tryGetMovId(v.title)] = 1;
        });

        if (Object.keys(movids).length == 1) {
            let u = df[df.length-1];
            return crawlByUrl(u.url, movid);
        }

        let d = clone(d1);
        d.results = df;
        d.results.reverse();
        return d;

    } else { // df.length == 1
        let u = df[0];
        return crawlByUrl(u.url, opt.qtext);
    }
}

function thenIfId (d1, opt) {
    let movid = util.tryGetMovId(d1.title);
    return javlib.crawl({
        qtext: movid,
        type: 'search',
        lang: 'en',
    })
    .then(d2 => {
        if (d2 instanceof MovieInfo) {
            let d = clone(d1);
            mixMovieInfo(d, d2);
            return d;
        }

        return d1;
    })
}

function crawl (options) {
    if (typeof options == 'string') {
        return dmm.crawl(options);
    }

    let qtext = (options.qtext || '').toLowerCase();
    let type = (options.type || '');

    if (!qtext || !type) {
        throw new Error('Invalid Argument');
    }

    let opt = {
        qtext: qtext,
        type: type
    }

    return dmm.crawl(opt)
    .then(d => {
        if (d instanceof SearchResult) {
            return thenIfSearch(d, opt);
        }

        if (d instanceof MovieInfo) {
            return thenIfId(d, opt);
        }

        return null;
    })
}

module.exports.crawl = crawl;
