'use strict';

const clone = require('clone');
const util = require('../util.js');
const crawlers = require('../crawlers');

const NAME = 'heydouga';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

const heydouga = crawlers['heydouga'];

function crawl (opt) {
    var opt1 = clone(opt);
    opt1.lang = 'ja';

    var opt2 = clone(opt);
    opt2.lang = 'en';

    return Promise.all([
        heydouga.crawl(opt1),
        heydouga.crawl(opt2),
    ])
    .then(data => {
        let d1 = data[0];
        let d2 = data[1];

        if (d1 == null) {
            return null;
        } else {
            let d = clone(d1);
            if (d2) {
                util.syncObjects(d, d2);
                if (d2.genres.length > 0) d.genres = d2.genres;
            }

            return d;
        }
    });
}

module.exports.crawl = crawl;
