'use strict';

const cache = require('../config/cache.js');
const crawlers = require('./crawlers');
const spiders = require('./spiders');
const util = require('./util.js');

function findCrawlers (selector) {
    let result = [];
    for (var name in crawlers) {
        let crawler = crawlers[name];
        if (selector(crawler)) {
            result.push(crawler);
        }
    }
    return result;
}

function firstCrawler (selector) {
    let result = findCrawlers(selector);
    if (result.length > 0) {
        return result[0];
    } else {
        return null;
    }
}

function findSpiders (selector) {
    let result = [];
    for (var name in spiders) {
        let spider = spiders[name];
        if (selector(spider)) {
            result.push(spider);
        }
    }
    return result;
}

function firstSpider (selector) {
    let result = findSpiders(selector);
    if (result.length > 0) {
        return result[0];
    } else {
        return null;
    }
}

function summon (options) {
    let target = options.target || '';
    let qtext = options.qtext || '';

    if (options.assign) {
        let assign = options.assign;
        
        let spider = firstSpider(v => v.name() == assign && 
                                      v.target() == target);
        if (spider) {
            return [spider, qtext];
        }

        let crawler = firstCrawler(v => v.name() == assign);
        if (crawler) {
            return [crawler, qtext];
        }
    }

    if (target == "human") {
        return [ 
            firstSpider(v => v.name() == "minnano-av"), 
            qtext 
        ];
    }

    if (target == "movie") {
        let movid = '';

        if (qtext.indexOf(' ') > 0) {
            let pos = qtext.indexOf(' ');
            let name = qtext.substring(0, pos).trim();
            
            let spider = firstSpider(
                v => 
                    v.name().indexOf(name) > -1 && 
                    v.target() == target);
            if (spider) {
                movid = qtext.substring(pos).trim();
                return [ spider, movid ];
            }
            
            let crawler = firstCrawler(v => v.name() == name);
            if (crawler) {
                movid = qtext.substring(pos).trim();
                return [ crawler, movid ];
            }

            movid = qtext;
            return [ null, movid ];

        } else {
            movid = qtext;
            return [ null, movid ];
        }
    }

    return [];
}

const HINTS_LIST = [
    { crawler: 'r18', regex: /^asw-\d{3}$/ },
    { crawler: 'r18', regex: /^ght-\d{3}$/ },
    { crawler: 'caribbeancom', regex: /^(carib|caribbean) \d{6}-\d{3}$/ },
    { crawler: 'caribbeancompr', regex: /^(caribpr|caribbeanpr) \d{6}_\d{3}$/ },
    { crawler: 'tokyo-hot', regex: /^tokyohot .*$/ },
    { crawler: 'avent', regex: /^(sky|red|rhj|skyhd|pt|pb|hey|bt|drc|s2m)-\d{3}$/ },
    { crawler: 'avent', regex: /^(cwp|cwdv|cz|smd|laf|kg|dsam)-\d+$/ },
    { crawler: 'r18', regex: /.*/ }, // unblockdmm.com is current down 18/01/23
];

function findHintsList (movid) {
    var qtext = (movid || '').toLowerCase();
    if (!qtext) {
        return [];
    }
    for (var hint of HINTS_LIST) {
        if (hint.regex.test(qtext)) {
            let id = qtext;
            if (qtext.indexOf(' ') > 0) {
                let pos = qtext.indexOf(' ');
                id = qtext.substring(pos).trim();
            }
            return [ hint.crawler, id ];
        }
    }
    return [];
}

function crawl (queryText, options) {
    let qtext = (queryText || '').toLowerCase();
    let opt = options || {};
    
    if (qtext == '') {
        return null;
    }

    let target = opt.target || '';
    let type = opt.type || '';

    if (!target || !type) {
        throw new Error("Invalid Arguments");
    }

    let [ crawler, id ] = summon({
        target: target, 
        qtext: qtext,
        assign: options.assign,
    });

    if (!crawler) {
        let [crawlerName, movid] = findHintsList(id);
        if (crawlerName) {
            crawler = summon({
                assign: crawlerName,
                target: target,
            })[0];
        }
        if (movid) {
            id = movid;
        }
    }

    if (!crawler) {
        return Promise.reject('Crawler not found');
    }

    let data_cached = cache.get('data', id);
    if (data_cached) {
        return Promise.resolve(data_cached);
    } else {
        let options = {
            "type": type,
            "qtext": id,
        };

        console.log(
            'Crawler: ' + crawler.name() + ' ' + 
            JSON.stringify(options)
        );

        return crawler.crawl(options).then(data => {
            switch (type) {
                case "search":
                    cache.set('data', id, data, 1800); // 30 minutes
                    break;

                case "id":
                    cache.set('data', id, data, 3600); // 1 hour
                    break;
            }
            
            return data;
        });
    }
}

module.exports.crawl = crawl;
