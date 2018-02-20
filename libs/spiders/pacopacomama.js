'use strict';

const clone = require('clone');
const util = require('../util.js');
const crawlers = require('../crawlers');

const NAME = 'pacopacomama';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

function crawl (opt) {
    let crawler1 = crawlers["pacopacomama"];
    let crawler2 = crawlers["pacopacomama-en"];

    return Promise.all([
        crawler1.crawl(opt),
        crawler2.crawl(opt)
            .catch(err => {
                console.log(err);
                return null
            }),
    ])
    .then(data => {
        let d1 = data[0];
        let d2 = data[1];

        if (d1 == null) {
            return null;
        } else {
            let d = util.syncObjects(d1, d2)
            if (d2) {
                if (d2.genres.length > 0) d.genres = d2.genres;
            }

            return d;
        }
    });
}

module.exports.crawl = crawl;
