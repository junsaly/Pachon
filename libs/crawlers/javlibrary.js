'use strict';

const { MovieInfo, SearchResult } = require('../../models/types.js');
const leech = require('../leech-promise.js');
const util = require('../util.js');
const dict = require('../category-dictionary.js');
const parseURL = require('url').parse;

const NAME = 'javlibrary';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "http://www.javlibrary.com/{lang}/vl_searchbyid.php?keyword={qtext}",
    "id": "http://www.javlibrary.com/{lang}/{qtext}",
}

const DOMAIN = 'www.javlibrary.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function formatDuration (val) {
    let minutes = parseInt(val);
    let hours = Math.floor(minutes / 60);
    minutes = minutes - hours * 60;

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }

    return hours + ':' + minutes + ':' + '00';
}

function getFootprint (data) {
    return {
        "crawler": NAME,
        "id": data.title,
    }
}

function thenIfSearch ($, url, urlpath, lang) {
    let result = new SearchResult({ 
        url: url,
        queryString: 
            util.replaceAll(url.split('keyword=')[1], '+', ' '),
        footprint: getFootprint
    });

    $('div.videos > div').each((i, el) => {
        let info = new MovieInfo();

        let ele = $(el);
        info.url = urlpath + ele.find('a').attr('href').substring(1);
        info.title = ele.find('a div.id').text().toUpperCase();

        let val = ele.find('a img').attr('src');
        if (val != '//') {
            info.posters.push({
                url: 'http:' + val
            });
        }
        
        if (lang == 'en') {
            info.transtitle = util.wrapText(ele.find('a div.title').text());
        }
        if (lang == 'ja') {
            info.origtitle = util.wrapText(ele.find('a div.title').text());
        }

        result.results.push(info);
    });

    result.more = $('div.page_selector').length > 0;

    // let mov = result.results[0];
    // if (result.queryString == mov.title) {
    //     return leech.get(mov.url)
    //     .then($$ => {
    //         return thenIfId($$, mov.url, urlpath);
    //     })
    // }

    return result;
}

function thenIfId ($, url, urlpath, lang) {
    let info = new MovieInfo({ 
        url: url, 
        country: 'Japan', 
        origlang: 'Japanese' 
    });

    let movid = $('div#video_id td.text').text();

    let val = $('div#video_jacket img').attr('src');
    if (val.indexOf('img/noimagepl.gif') == - 1) {
        info.posters.push({
            url: 'http:' + val
        });
    }
    
    info.title = movid.toUpperCase();

    if (lang == 'en') {
        info.transtitle = $('h3.post-title.text').text()
            .replace(movid, '')
            .trim();
    }
    
    if (lang == 'ja') {
        info.origtitle = $('h3.post-title.text').text()
            .replace(movid, '')
            .trim();
    }

    info.releasedate = $('div#video_date td.text').text();
    info.year = info.releasedate.substring(0, 4);

    info.duration = formatDuration(
        $('div#video_length span.text').text()
    );

    let ele = $('div#video_director a');
    if (ele.length > 0) {
        info.director = {
            url: urlpath + ele.attr('href'),
            text: ele.text(),
        };
    }

    ele = $('div#video_maker a');
    if (ele.length > 0) {
        info.maker = ele.text();
    }

    ele = $('div#video_label a');
    if (ele.length > 0) {
        info.label = {
            url: urlpath + ele.attr('href'),
            text: ele.text(),
        };
    }

    $('div#video_genres a').each((i, el) => {
        let ele = $(el);
        let genre = {
            url: urlpath + ele.attr('href'),
            text: dict(lang, ele.text()),
        }

        info.genres.push(genre);
    });

    $('div#video_cast a').each((i, el) => {
        let ele = $(el);
        let actor = {
            url: urlpath + ele.attr('href'),
            text: ele.text(),
        }

        info.actors.push(actor);
    });

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
    let lang = "en";
    if (typeof opt == 'string') {
        url = opt;
    }

    if (typeof opt == 'object') {
        let type = opt.type || '';
        let qtext = opt.qtext || '';
        lang = opt.lang || 'en';
        if (type && qtext) {
            url = TEMPLATE[type]
                .replace('{lang}', lang)
                .replace('{qtext}', qtext);
        }
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }
    
    let url_parsed = parseURL(url);
    let urlpath = BASE_URL + 
        url_parsed.pathname.substring(0, url_parsed.pathname.lastIndexOf('/'));

    return new Promise((resolve, reject) => {
        leech.get(url)
        .then($ => {
            if ($('title:contains("404")').length > 0 || 
                $('div:contains("Search Tips")').length > 0 ||
                $('div:contains("検索ヒント")').length > 0) {
                resolve(null);
            } else {

                if ($('div:contains("ID Search Result")').length > 0 ||
                    $('div:contains("品番検索結果")').length > 0) {
                    // Search result
                    Promise.resolve(thenIfSearch($, url, urlpath, lang))
                        .then(data => resolve(data))
                        .catch(err => catchError(err, resolve, reject));
                }

                else {
                    // Movie content
                    try {
                        let info = thenIfId($, url, urlpath, lang);
                        resolve(info);
                    } catch (ex) {
                        reject(ex);
                    }
                }
            }
        })
        .catch(err => catchError(err, resolve, reject));
    });
}

module.exports.crawl = crawl;
