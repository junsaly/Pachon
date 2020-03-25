'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = 'pacopacomama-en';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://en.pacopacomama.com/eng/moviepages/{qtext}/index.html",
}

const DOMAIN = 'en.pacopacomama.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function formatTitle (val) {
    return val.replace(BASE_URL, '')
        .replace('/eng/moviepages/', '')
        .replace('/index.html', '')
        .trim();
}

function formatRelDurData (val) {
    var p = val.split(' ');
    p.forEach(item => {
        item = item.trim()
    })

    var relRawData = p[2].slice(0, 10)

    var releasedate = relRawData;

    var year = releasedate.slice(0, 4);

    var duration = p[3].trim()

    return {
        "releasedate": releasedate,
        "year": year,
        "duration": duration,
    }
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
        return leech.get(url)
        .then($ => {

            if ($('#main > h1').length == 0) {
                return resolve(null)
            }

            let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });

            info.movid = formatTitle(url);

            info.title = 'Pacopacomama ' + info.movid;
            info.transtitle = $('div#main > h1').text().trim();

            let { releasedate, year, duration } = formatRelDurData($("dt.date").text().trim());

            info.year = year;
            info.releasedate = releasedate;
            info.duration = duration;

            info.maker = 'Pacopacomama';

            $('dd.diff tr:nth-child(1) td:nth-child(2) a').each((i, el) => {
                let ele = $(el);
                let actor = {
                    url: BASE_URL + ele.attr('href'),
                    text: ele.text(),
                }

                info.actors.push(actor);
            });

            $('dd.diff tr:nth-child(4) td:nth-child(2) a').each((i, el) => {
                let ele = $(el);
                let genre = {
                    url: BASE_URL + ele.attr('href'),
                    text: ele.text(),
                };

                info.genres.push(genre);
            });

            info.covers.push({
                url: `http://www.pacopacomama.com/moviepages/${info.movid}/images/l_hd.jpg`
            });

            info.thumb.push({
                url: `http://www.pacopacomama.com/moviepages/${info.movid}/images/l_thum.jpg`
            });

            resolve(info);
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
    });
}

module.exports.crawl = crawl;
