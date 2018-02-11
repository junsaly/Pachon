'use strict';

const { MovieInfo, SearchResult } = require('../../models/types.js');
const leech = require('../leech-promise.js');
const util = require('../util.js');
const dict = require('../category-dictionary.js');

const urlParse = require('url').parse;
const querystring = require('querystring');

const NAME = 'avent';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "http://www.aventertainments.com/search_Products.aspx?languageID={lang}&keyword={qtext}&searchby=keyword",
    "id": "http://www.aventertainments.com/product_lists.aspx?product_id={qtext}&languageID={lang}&dept_id=29",
}

const LANG_TMP = {
    "en": "1",
    "ja": "2",
}

const DOMAIN = 'www.aventertainments.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

const LangMap = {
    'releasedate': { 'ja': '発売日:', 'en': 'Release Date:' },
    'duration': { 'ja': '収録時間:', 'en': 'Play time:' },
    'maker': { 'ja': 'スタジオ:', 'en': 'Studio:' },
    'title': { 'ja': '商品番号:', 'en': 'Item#:' },
    'actors': { 'ja': '主演女優:', 'en': 'Starring:' },
    'genres': { 'ja': 'カテゴリ一覧:', 'en': 'Category:' },
}

function getFootprint (data) {
    return {
        "crawler": NAME,
        "id": data.movid,
    };
}

function formatMovId (val) {
    var uri = urlParse(val);
    var qstr = querystring.parse(uri.query);
    return qstr['product_id'];
}

function formatReleaseDate (val) {
    val = val.replace('Release Date', 'ReleaseDate').split(' ')[1];
    val = val.split('/');

    var day = parseInt(val[1]), 
        month = parseInt(val[0]), 
        year = parseInt(val[2]);

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;

    return year + '-' + month + '-' + day;
}

function formatDuration (val) {
    val = val.replace('Play time', 'Playtime').split(' ')[2];
    let minutes = parseInt(val);
    let hours = Math.floor(minutes / 60);
    minutes = minutes - hours * 60;

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }

    return hours + ':' + minutes + ':' + '00';
}

function formatSearchText (val) {
    var uri = urlParse(val);
    var qstr = querystring.parse(
        uri.path.replace(uri.pathname, '')
    );
    return qstr['keyword'];
}

function thenIfSearch ($, lang) {
    let result = new SearchResult({url: $.getCurrentURL(), footprint: getFootprint});
    result.queryString = formatSearchText(result.url);

    $('table[id$="MyList"] table').each((i, el) => {
        let ele = $(el);
        let info = new MovieInfo();

        let newItem = isNewItem(ele, lang);
        let imgTypeCode = newItem ? "new" : "archive";

        ele = ele.find('td').eq(1)[0];
        info.url = ele.childNodes[1].attribs["href"];
        info.movid = formatMovId(info.url);
        if (lang == 'en') {
            info.transtitle = util.wrapText(ele.childNodes[1].children[0].data.trim());
        }
        if (lang == 'ja') {
            info.origtitle = util.wrapText(ele.childNodes[1].children[0].data.trim());
        }

        if (newItem) {
            info.title = ele.childNodes[13].data.replace(LangMap['title'][lang], '').trim();
        } else {
            info.title = ele.childNodes[11].data.replace(LangMap['title'][lang], '').trim();
        }
        
        info.posters.push({
            url: `http://imgs.aventertainments.com/${imgTypeCode}/jacket_images/dvd1${info.title.toLowerCase()}.jpg`
        });

        result.results.push(info);
    })

    result.more = $('.pagination').eq(0).find('a').length > 3;

    if (result.results.length == 1) {
        let mov = result.results[0];
        return leech.get(mov.url)
        .then($$ => {
            return thenIfId($$, lang);
        })
    }

    return result;
}

function thenIfId ($, lang) {
    let info = new MovieInfo({url: $.getCurrentURL(), country: 'Japan', origlang: 'Japanese'});
    
    info.movid = formatMovId(info.url);

    if (lang == 'en') {
        info.transtitle = util.wrapText($('div#mini-tabet > h2').text().trim());
    }

    if (lang == 'ja') {
        info.origtitle = util.wrapText($('div#mini-tabet > h2').text().trim());
    }
    
    info.releasedate = formatReleaseDate(
        $(`div#titlebox li:contains("${LangMap['releasedate'][lang]}")`).text().trim()
    );
    info.year = info.releasedate.substring(0, 4);

    info.duration = formatDuration(
        $(`div#titlebox li:contains("${LangMap['duration'][lang]}")`).text().trim()
    );
    
    info.maker = $(`div#titlebox li:contains("${LangMap['maker'][lang]}") > a`).text().trim();

    info.title = $('div#mini-tabet div').text().replace(LangMap['title'][lang], '').trim();
    
    let imgCode = info.title.toLowerCase();
    let imgTypeCode = isNewItem($, lang) ? "new" : "archive";

    info.title = processREDTitle(info.title);

    info.posters.push({
        url: `http://imgs.aventertainments.com/${imgTypeCode}/bigcover/dvd1${imgCode}.jpg`
    })

    info.thumb.push({
        url: `http://imgs.aventertainments.com/${imgTypeCode}/jacket_images/dvd1${imgCode}.jpg`
    })

    $(`div#titlebox li:contains("${LangMap['actors'][lang]}") > a`).each((i, el) => {
        let ele = $(el);
        let actor = {
            url: ele.attr('href'),
            text: ele.text().trim(),
        }
        info.actors.push(actor);
    })

    $(`div#detailbox span:contains("${LangMap['genres'][lang]}")`).next().find('a').each((i, el) => {
        let ele = $(el);
        let genre = {
            url: ele.attr('href'),
            text: dict('ja', ele.text().trim()),
        }
        info.genres.push(genre);
    })

    info.screenshots.push({
        url: `http://imgs.aventertainments.com/${imgTypeCode}/screen_shot/dvd1${imgCode}.jpg`
    });

    return info;
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

        if (/^red-\d{3}$/.test(qtext)) {
            qtext = util.replaceAll(qtext, '-', '')
        }

        lang = opt.lang || 'en';
        if (type && qtext) {
            url = TEMPLATE[type]
                .replace('{lang}', LANG_TMP[lang])
                .replace('{qtext}', qtext);
        }
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }

    return new Promise((resolve, reject) => {
        leech.get(url)
        .then($ => {
            if ($('table[id$="MyList"] table').length == 0 &&
                $('img[src="/img/pagenotfound.gif"]').length > 0) {
                resolve(null);
            } else {
                if ($('table[id$="MyList"]').length == 0) {
                    // Movie content
                    try {
                        let info = thenIfId($, lang);
                        resolve(info);
                    } catch (ex) {
                        reject(ex);
                    }
                } else {
                    // Search result
                    Promise.resolve(thenIfSearch($, lang))
                        .then(data => resolve(data))
                        .catch(err => util.catchURLError(url, err, resolve, reject));
                }
            }
        })
        .catch(err => util.catchURLError(url, err, resolve, reject));
    });
}

function processREDTitle(title) {
    if (/^RED\d{3}$/.test(title.toUpperCase())) {
        return util.replaceAll(title, 'RED', 'RED-')
    }

    return title;
}

function isNewItem($, lang) {
    let img = {
        "ja": '/img/gif_dlst.gif',
        "en": '/img/en/gif_dlst.gif',
    }

    if ($.find) {
        return $.find(`img[src="${img[lang]}"]`).length > 0;
    } else {
        return $(`img[src="${img[lang]}"]`).length > 0;
    }
}

module.exports.crawl = crawl;
