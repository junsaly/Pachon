'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');
const util = require('../util.js');

const NAME = 'heyzo-en';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://en.heyzo.com/moviepages/{qtext}/index.html",
}

const DOMAIN = 'en.heyzo.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function getMovieID (val) {
    return val.replace('http://en.heyzo.com/moviepages/', '')
              .replace('/index.html', '');
}

function crawl (opt) {
    let url = "";
    if (typeof opt == 'string') {
        url = opt;
    }

    if (typeof opt == 'object') {
        let qtext = opt.qtext || '';
        if (qtext) {
            url = TEMPLATE["id"].replace('{qtext}', qtext);
        }
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }

    return new Promise((resolve, reject) => {
        leech.get(url)
        .then($ => {
            if ($('h1:contains("404")').length > 0) {
                resolve(null);
            } else {

                let info = new MovieInfo({ 
                    url: url, 
                    country: 'Japan', 
                    origlang: 'Japanese' 
                });

                let movid = getMovieID(url);
                info.movid = movid;

                info.title = 'HEYZO ' + movid;
                info.transtitle = util.formatText($('div#movie h1').text()).split(' - ')[0];

                info.covers.push({
                    url: `http://en.heyzo.com/contents/3000/${info.movid}/images/player_thumbnail_en.jpg`
                })

                info.thumb.push({
                    url: `http://en.heyzo.com/contents/3000/${info.movid}/images/thumbnail.jpg`
                })

                info.releasedate = util.formatText($('.movieInfo td:contains("Released")').next().text());
                info.year = info.releasedate.substring(0, 4);

                $('.movieInfo td:contains("Actress")').next().find('a').each((i, el) => {
                    let ele = $(el);
                    let actor = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }

                    info.actors.push(actor);
                });

                let ele = $('.movieInfo td:contains("Series")').next().find('a');
                
                if (ele.length > 0) {
                    info.series = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }
                }

                $('.movieInfo td:contains("Type")').next().find('a').each((i, el) => {
                    let ele = $(el);
                    let genre = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }

                    info.genres.push(genre);
                });

                $('.movieInfo td:contains("Sex Styles")').next().find('a').each((i, el) => {
                    let ele = $(el);
                    let genre = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }

                    info.genres.push(genre);
                });

                $('.movieInfo td:contains("Theme")').next().find('a').each((i, el) => {
                    let ele = $(el);
                    let genre = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }

                    info.genres.push(genre);
                });

                info.maker = 'HEYZO';

                resolve(info);
            }
        })
        .catch(err => {
            var mss = err.message;
            if (mss.indexOf('HTTP Code') >= 0) {
                console.log('<' + mss + '> at ' + url)
                resolve(null);
            } else {
                reject(err);
            }
        });
    })
}

module.exports.crawl = crawl;
