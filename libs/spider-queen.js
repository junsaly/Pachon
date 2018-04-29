'use strict';

const cache = require('../config/cache.js');
const crawlers = require('./crawlers');
const spiders = require('./spiders');
const util = require('./util.js');
const strategies = require('../config/strategies.js');

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

function runStrategy (strategy, options) {
    try {
        var [crawler, _] = summon({
            assign: strategy.crawler,
            target: options.target,
        })
    
        var id = strategies.getId(options.qtext)
    
        if (!crawler) {
            return Promise.resolve({
                "success": false,
                "error": new Error("Crawler not found")
            });
        }
    
        let data_cached = cache.get('data', id);
        if (data_cached) {
            return Promise.resolve({
                "success": true,
                "data": data_cached
            });
        }

        console.log(
            'Crawler: ' + crawler.name() + ' ' + 
            JSON.stringify(options)
        );
    
        return crawler.crawl({
            "type": options.type,
            "qtext": id,
        }).then(data => {
            return {
                "success": data != null,
                "data": data
            };
        }).catch(err => {
            return {
                "success": false,
                "error": err
            };
        });
    }
    catch (ex) {
        return Promise.resolve({
            "success": false,
            "error": ex
        })
    }
    
}

function runStrategyList (strategies, options, errors) {
    var opt = options || {};
    var errs = errors || [];
    var strategy = strategies.shift();

    if (!strategy) {
        return Promise.reject(errs);
    }

    return runStrategy(strategy, opt)
        .then(result => {
            var success = result.success;
            if (success) {
                return result.data
            }

            errs.push({
                "strategy": strategy,
                "options": opt,
                "error": result.error,
            });
            
            return runStrategyList(strategies, opt, errs);
        });
}

function findStrategies (movid) {
    var q = (movid || '').toLowerCase();
    if (!q) {
        return [];
    }

    var strategyList = [];

    for (let strategy of strategies.STRAGETIES.main) {
        if (strategies.checkCondition(strategy.condition, q)) {
            strategyList.push(strategy);
        }
    }

    if (strategyList.length == 0) {
        for (let strategy of strategies.STRAGETIES.all) {
            strategyList.push(strategy);
        }
    }

    return strategyList;
}

function cacheData (type, id, data) {
    switch (type) {
        case "search":
            cache.set('data', id, data, 900); // 15 minutes
            break;

        case "id":
            cache.set('data', id, data, 1800); // 30 minutes
            break;
    }
}

function crawl (queryText, options) {
    let qtext = (queryText || '').toLowerCase();
    let opt = options || {};
    
    if (qtext == '') {
        return Promise.resolve(null);
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

    if (crawler) {

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
                cacheData(type, id, data);
                return data;
            });
        }

    } else {

        let strategies = findStrategies(id);

        if (strategies.length == 0) {
            return Promise.reject('Crawler not found');
        }

        return runStrategyList(strategies, {
            "type": type,
            "target": target, 
            "qtext": id,
        }).then(data => {
            cacheData(type, id, data);
            return data;
        });
    }
}

module.exports.crawl = crawl;
