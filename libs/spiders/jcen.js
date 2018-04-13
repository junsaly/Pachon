'use strict';

const crawlers = require('../crawlers');
const leech = require('../leech-promise.js');
const util = require('../util.js');
const { MovieInfo, SearchResult } = require('../../models/types.js');

const NAME = 'jcen';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

const r18 = crawlers["r18"];
const dmm = crawlers["dmm"];
const javlib = crawlers["javlibrary"];

function silent (promise) {
    return promise.then(r => {
        return {
            success: r != null,
            data: r
        }
    }).catch(e => {
        console.log(e);

        return {
            success: false,
            error: e
        }
    })
}

function crawl (options) {
    if (typeof options == 'string') {
        // case id
        return dmm.crawl(options);

    } else {
        // case search
        let qtext = (options.qtext || '').toLowerCase();
        let type = (options.type || '');

        if (!qtext || !type) {
            throw new Error('Invalid Argument');
        }

        let opt = {
            qtext: qtext,
            type: type
        }

        let exactMatch = options.exactMatch || true;

        return Promise.all([
            // ja record
            silent(
                dmm.crawl(Object.assign({}, opt, {matchExact: true}))
            ),
            silent(
                javlib.crawl(Object.assign({}, opt, {lang: "ja", matchExact: true}))
            ),
            // en record
            silent(
                r18.crawl(Object.assign({}, opt, {matchExact: true}))
            ),
            silent(
                javlib.crawl(Object.assign({}, opt, {lang: "en", matchExact: true}))
            ),
        ]).then(records => {
            let ja = {
                "dmm": records[0],
                "javlib": records[1],
            };

            let r_ja = null;
            if (ja["javlib"].success && ja["javlib"].data instanceof MovieInfo) {
                r_ja = ja["javlib"].data;

                if (ja["dmm"].success && 
                    (ja["dmm"].data instanceof MovieInfo) &&
                    util.compareStringSimilarity(ja["dmm"].data.origtitle, ja["javlib"].data.origtitle) > 0.7) {

                    r_ja = util.syncObjects(ja["dmm"].data, ja["javlib"].data);
                }
            }

            /* ---------- */

            let en = {
                "r18": records[2],
                "javlib": records[3],
            };

            let r_en = null;
            if (en["r18"].success && en["r18"].data instanceof MovieInfo) {
                r_en = en["r18"].data;

                if (en["javlib"].success && en["javlib"].data instanceof MovieInfo) {
                    r_en = util.syncObjects(en["r18"].data, en["javlib"].data);
                }
                
            } else if (en["javlib"].success && en["javlib"].data instanceof MovieInfo) {
                r_en = en["javlib"].data;
            }

            /* ---------- */

            if (!r_ja && !r_en) {
                if (exactMatch) {
                    return null;
                }
            }

            r_ja = r_ja || new MovieInfo();
            r_en = r_en || new MovieInfo();

            let r = util.syncObjects(r_ja, r_en);
            if (r_en.title) r.title = r_en.title;
            if (r_en.url) r.url = r_en.url;
            if (r_en.series) r.series = r_en.series;
            if (r_en.description) r.description = r_en.description;
            if (r_en.genres.length > 0) r.genres = r_en.genres;
            if (r_en.posters.length > 0) r.posters = r_en.posters;
            if (r_en.covers.length > 0) r.covers = r_en.covers;
            if (r_en.thumb.length > 0) r.thumb = r_en.thumb;
            if (r_en.screenshots.length > 0) r.screenshots = r_en.screenshots;

            return r;
        })
    }
}

module.exports.crawl = crawl;