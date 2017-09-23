'use strict';

const { MovieInfo, SearchResult } = require('../../models/types.js');
const leech = require('../leech-promise.js');
const util = require('../util.js');
const months = {
    "Jan." : 1,
    "Feb." : 2,
    "Mar." : 3,
    "Apr." : 4,
    "May"  : 5,
    "June" : 6,
    "July" : 7,
    "Aug." : 8,
    "Sept.": 9,
    "Oct." : 10,
    "Nov." : 11,
    "Dec." : 12,
}

const NAME = 'r18';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "http://www.r18.com/common/search/searchword={qtext}/",
    "id": "http://www.r18.com/videos/vod/movies/detail/-/id={qtext}/",
}

const DOMAIN = 'www.r18.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function formatReleaseDate (val) {
    val = val.split(',');
    let year = val[1].trim();
    val = val.split(' ');
    let month = months[val[0].trim()];
    let day = val[1].trim();

    if (day < 10) {day = '0' + day;}
    if (month < 10) {month = '0' + month;}

    return year + '-' + month + '-' + day;
}

function formatText (val) {
    val = val.trim();
    if (val == '----') {
        return '';
    }
    return val
}

function formatDuration (val) {
    let minutes = parseInt(val);
    let hours = Math.floor(minutes / 60);
    minutes = minutes - hours * 60;

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }

    return hours + ':' + minutes + ':' + '00';
}

function formatJapaneseName (val) {
    if (val.indexOf('(') > 0) {
        return val.split('(')[0].trim();
    }
    return val;
}

function getFootprint (data) {
    return {
        "crawler": NAME,
        "id": data.title,
    };
}

function thenIfSearch ($, url) {
    let result = new SearchResult({url: url, footprint: getFootprint});
    result.queryString = $('.searchBox').attr('value');

    $('.cmn-list-product01 li').each((i, el) => {
        let ele = $(el);
        let info = new MovieInfo();

        info.url = ele.find('a').attr('href');
        info.transtitle = ele.find('img').attr('alt');
        info.title = ele.find('.cmn-btn-imgHover01 a').attr('data-id');
        info.posters.push({
            url: util.replaceAll(
                'http://pics.r18.com/digital/video/{id}/{id}ps.jpg', 
                '{id}', 
                info.title)
        });

        result.results.push(info);
    })

    result.more = $('.cmn-list-pageNation02 a').length > 3;

    if (result.results.length == 1) {
        let mov = result.results[0];
        return leech.get(mov.url)
        .then($$ => {
            return thenIfId($$, mov.url);
        })
    }

    return result;
}

function thenIfId ($, url) {
    let info = new MovieInfo({url: url, country: 'Japan', origlang: 'Japanese'});
    
    info.transtitle = $('h1').first().text().trim();
    info.releasedate = formatReleaseDate(
        $('dt:contains("Release Date:")').next().text().trim()
    );
    info.year = info.releasedate.substring(0, 4);

    let duration = formatText($('[itemprop=duration]').text());
    if (duration) {
        info.duration = formatDuration(
            duration.replace('min.', '').trim()
        );
    }

    let director = formatText($('[itemprop=director]').text().trim());
    if (director) {
        info.director = {
            url: '',
            text: director
        };
    }

    let maker = $('[itemprop=productionCompany] a');
    if (maker.length > 0) {
        info.maker = maker.text().trim();
    }

    let label = formatText($('dt:contains("Label:")').next().text().trim());
    if (label) {
        info.label = {
            url: '',
            text: label
        }
    }

    let movid = $('dt:contains("DVD ID:")').next().text().trim();
    info.title = movid;

    let contentid = $('dt:contains("Content ID:")').next().text().trim();
    info.posters.push({
        url: util.replaceAll(
            'http://pics.r18.com/digital/video/{id}/{id}pl.jpg', 
            '{id}', 
            contentid)
    });

    let series = $('dt:contains("Series:")').next().find('a');
    if (series.length > 0) {
        info.series = {
            url: series.attr('href'),
            text: series.text().trim(),
        }
    }

    let origlang = formatText($('dt:contains("Languages:")').next().text().trim());
    if (origlang) {
        info.origlang = origlang;
    }

    $('[itemprop=actors] a').each((i, el) => {
        let ele = $(el);
        let actor = {
            url: ele.attr('href'),
            text: formatJapaneseName(ele.text().trim()),
        }
        info.actors.push(actor);
    })

    $('.product-categories-list a').each((i, el) => {
        let ele = $(el);
        let genre = {
            url: ele.attr('href'),
            text: ele.text().trim(),
        }
        info.genres.push(genre);
    })

    $('.img02 img').each((i, el) => {
        let ele = $(el);
        let screenshot = {
            url: ele.attr('data-src'),
        }
        info.screenshots.push(screenshot);
    })

    return info;
}

function catchError (err, resolve, reject) {
    var mss = err.message;
    if (mss.indexOf('HTTP Code') >= 0) {
        console.log('<' + mss + '> at ' + url)
        resolve(null);
    } else {
        reject(err);
    }
}

function crawl (opt) {
    let url = "";
    if (typeof opt == 'string') {
        url = opt;
    }

    if (typeof opt == 'object') {
        let type = opt.type || '';
        let qtext = opt.qtext || '';
        if (type && qtext) {
            url = TEMPLATE[type].replace('{qtext}', qtext);
        }
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }

    return new Promise((resolve, reject) => {
        leech.get(url)
        .then($ => {
            if ($('div:contains("Unable to find related item for")').length > 0 ||
                $('h1:contains("404")').length > 0) {
                resolve(null);
            } else {
                if ($('.product-details').length > 0) {
                    // Movie content
                    try {
                        let info = thenIfId($, url);
                        resolve(info);
                    } catch (ex) {
                        reject(ex);
                    }
                } else {
                    // Search result
                    Promise.resolve(thenIfSearch($, url))
                        .then(data => resolve(data))
                        .catch(err => catchError(err, resolve, reject));
                }
            }
        })
        .catch(err => catchError(err, resolve, reject));
    });
}

module.exports.crawl = crawl;
