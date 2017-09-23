'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');
const util = require('../util.js');

const NAME = 'heydouga';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://www.heydouga.com/moviepages/{0}/{1}/index.html",
}

const DOMAIN = 'www.heydouga.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function getBaseURL (lang) {
    var res = BASE_URL;
    if (lang == 'en') {
        return res.replace('www', 'en');
    }
    return res;
}

function formatMovID (val, lang) {
    var res = val;
    if (lang == 'ja') {
        res = res.replace('http://www.heydouga.com/moviepages/', '');
    }
    if (lang == 'en') {
        res = res.replace('http://en.heydouga.com/moviepages/', '');
    }
    res = res.replace('/index.html', '');
    res = res.replace('/', '-');
    
    return res;
}

function formatDuration (val) {
    let minutes = parseInt(val);
    let hours = Math.floor(minutes / 60);
    minutes = minutes - hours * 60;

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }

    return hours + ':' + minutes + ':' + '00';
}

function formatPoster (val, lang) {
    var res = val;
    if (lang == 'en') {
        res = res.replace('en', 'image01');
    }
    if (lang == 'ja') {
        res = res.replace('www', 'image01');
    }
    res = res.replace('moviepages', 'contents');
    res = res.replace('index.html', 'player_thumb.jpg');

    return res;
}

function crawl (opt) {
    let url = "";
    let lang = "en";
    if (typeof opt == 'string') {
        url = opt;
    }

    if (typeof opt == 'object') {
        let qtext = opt.qtext || '';
        lang = opt.lang || 'en';
        if (qtext) {
            var q = util.split(qtext, ['/', '-', '_', 'PPV']);
            url = util.format(TEMPLATE["id"], q[0], q[1]);
        }
        if (lang == 'en') {
            url = url.replace('www', 'en');
        }
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }

    return new Promise((resolve, reject) => {
        leech.get(url)
        .then($ => {
            if ($('title:contains("404")').length > 0) {
                resolve(null);
            } else {
                let info = new MovieInfo({ 
                    url: $.getCurrentURL(),
                    country: 'Japan',
                    origlang: 'Japanese',
                    maker: 'Hey動画',
                });

                let rootEl = $('#movie-info');

                let movid = formatMovID(info.url, lang);
                info.title = 'Heydouga ' + movid;

                var val = $('#contents-header h1')[0].childNodes;
                val = val[val.length - 1].nodeValue;

                if (lang == 'ja') {
                    info.origtitle = val;
                }

                if (lang == 'en') {
                    info.transtitle = val;
                }

                info.releasedate = rootEl.find('li').eq(0).find('span').eq(1).text();
                info.year = info.releasedate.substring(0, 4);

                var val = rootEl.find('li').eq(1).find('a');
                val.text().split(' ').forEach(v => {
                    let actor = {
                        url: getBaseURL(lang) + val.attr('href'),
                        text: v.trim()
                    }

                    info.actors.push(actor);
                });

                var val = rootEl.find('li').eq(2).find('a');
                info.provider = {
                    url: getBaseURL(lang) + val.attr('href'),
                    text: val.text().trim()
                }

                var val = rootEl.find('li').eq(3).find('span').eq(1).text();
                info.duration = formatDuration(val.split(' ')[0]);

                if ($('.movie-description').length > 0) {
                    info.description = $('.movie-description').text().trim();
                }

                $('#movie-category a').each((i, el) => {
                    let ele = $(el);
                    let genre = {
                        url: getBaseURL(lang) + ele.attr('href'),
                        text: ele.text().trim()
                    };

                    info.genres.push(genre);
                });

                info.posters.push({
                    url: formatPoster(info.url, lang)
                });

                resolve(info);
            }
        })
        .catch(err => util.catchError(err, resolve, reject));
    })
}

module.exports.crawl = crawl;
