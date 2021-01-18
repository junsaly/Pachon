'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = 'sm-miracle';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://sm-miracle.com/movie3.php?num={qtext}",
}

const DOMAIN = 'sm-miracle.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function getMovIdFromURL (val) {
    return val.split("num=")[1].trim();
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

            let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });
            info.movid = getMovIdFromURL(url);
            info.title = info.movid;
            info.maker = "SM-MiRACLE"

            info.covers.push({
                url: `http://material.sm-miracle.com/movie/${info.movid}/cap.jpg`
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
