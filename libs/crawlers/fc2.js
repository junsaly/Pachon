'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');
const util = require('../util.js');
const dict = require('../category-dictionary.js');

const NAME = 'fc2';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://adult.contents.fc2.com/article/{qtext}/",
}

const DOMAIN = 'adult.contents.fc2.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function crawl (opt) {
    let url = "";
    if (typeof url == "string") {
        url = opt;
    }

    let qtext = opt.qtext || "";
    if (qtext) {
        url = TEMPLATE["id"].replace("{qtext}", qtext);
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }

    return leech.get(url)
    .then($ => {
        let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });

        info.origtitle = $('.items_article_headerInfo > h3').text().trim();

        let dReleaseDate = $('.items_article_Releasedate').text().split(":")[1].trim();
        info.releasedate = util.replaceAll(dReleaseDate, '/', '-');
        info.year = dReleaseDate.slice(0, 4);

        info.posters.push({
            url: "https:" + $('.items_article_MainitemThumb img').attr('src')
        });

        info.thumb.push({
            url: "https:" + $('.items_article_MainitemThumb img').attr('src')
        });

        $('a[data-image-slideshow="sample-images"]').each((i, el) => {
            let ele = $(el);
            info.screenshots.push({
                url: ele.attr('href')
            })
        });

        let dDirector = $('.items_article_headerInfo ul li:nth-child(3) a');
        let makerURL = dDirector.attr("href");

        info.director = {
            url: dDirector.attr("href"),
            text: dDirector.text()
        }

        info.label = {
            url: makerURL,
            text: makerURL.split('/').slice(-2, -1)[0]
        };

        info.maker = dDirector.text();

        // info.description = $('section.explain p.text').html().trim();

        info.genres.push({
            url: '',
            text: 'Uncensored'
        });

        return info;
    });
}

module.exports.crawl = crawl;
