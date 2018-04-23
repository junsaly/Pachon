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
    "id": "http://adult.contents.fc2.com/article_search.php?id={qtext}",
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

        info.origtitle = $('h2.title_bar').text().trim();

        let dReleaseDate = $('.main_info_block dt:contains("販売日")').next().text().trim();
        info.releasedate = util.replaceAll(dReleaseDate, '/', '-');
        info.year = dReleaseDate.slice(0, 4);

        let dDirector = $('.main_info_block dt:contains("販売者")').next().find('a');
        info.director = {
            url: BASE_URL + dDirector.attr("href"),
            text: dDirector.text()
        }

        info.posters.push({
            url: $('a.analyticsLinkClick_mainThum').attr('href')
        });

        info.thumb.push({
            url: $('a.analyticsLinkClick_mainThum').attr('href')
        });

        $('ul.images a').each((i, el) => {
            let ele = $(el);
            info.screenshots.push({
                url: ele.attr('href')
            })
        });

        info.maker = 'FC2コンテンツマーケット';

        info.description = $('section.explain p.text').html().trim();

        info.genres.push({
            url: '',
            text: 'Uncensored'
        })

        return info;
    });
}

module.exports.crawl = crawl;
