'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');
// const util = require('../util.js');
// const dict = require('../category-dictionary.js');

const NAME = '10musume';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "https://www.10musume.com/dyn/phpauto/movie_details/movie_id/{qtext}.json"
}

const DOMAIN = 'www.10musume.com';
module.exports.domain = function () {
    return DOMAIN;
}

// const BASE_URL = 'http://' + DOMAIN;

// function formatTitle (val) {
//     return val.replace(BASE_URL, '')
//         .replace('/moviepages/', '')
//         .replace('/index.html', '')
//         .trim();
// }

function formatDuration (sec_num) {
    // val in seconds
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) { hours   = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }

    return hours + ':' + minutes + ':' + seconds;
}

function crawl (opt) {
    let url = "";
    if (typeof opt == 'string') {
        url = opt;
    }

    let movid = "";
    if (typeof opt == 'object') {
        let qtext = opt.qtext || '';
        if (qtext) {
            url = TEMPLATE["id"].replace('{qtext}', qtext);
            movid = qtext;
        }
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }

    return new Promise((resolve, reject) => {
        return leech.get({
            url: url,
            charset: 'utf8'
        })
        .then($ => {
            let d_details = JSON.parse($('body').text());

            if (d_details.hasOwnProperty("Title") === false) {
                return resolve(null);
            } else {
                let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });

                info.movid = movid;
                info.title = `10musume ${info.movid}`;
                info.origtitle = d_details["Title"];
                info.transtitle = d_details["TitleEn"];

                info.releasedate = d_details["Release"];
                info.year = info.releasedate.substring(0, 4);

                info.duration = formatDuration(parseInt(d_details["Duration"]));

                info.maker = '天然むすめ';

                for (let i=0; i<d_details["UC"].length; i++) {
                    let genre = {
                        url: `https://www.10musume.com/search/?c=${d_details["UC"][i]}`,
                        text: d_details["UCNAMEEn"][i],
                    };

                    info.genres.push(genre);
                }

                for (let i=0; i<d_details["ActorID"].length; i++) {
                    let actor = {
                        url: `https://www.10musume.com/search/?a=${d_details["ActorID"][i]}`,
                        text: d_details["ActressesJa"][i],
                    }

                    info.actors.push(actor);
                }

                info.description = d_details["Desc"];

                info.covers.push({
                    url: `http://www.10musume.com/moviepages/${info.movid}/images/str.jpg`
                });

                info.thumb.push({
                    url: `http://www.10musume.com/moviepages/${info.movid}/images/list1.jpg`
                });

                info.rating = parseInt(d_details["AvgRating"]) * 2;

                return resolve(info);
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
    });
}

module.exports.crawl = crawl;
