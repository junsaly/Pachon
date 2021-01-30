'use strict';

const { MovieInfo, SearchResult } = require('../../models/types.js');
const leech = require('../leech-promise.js');
const util = require('../util.js');

const NAME = 'javdb';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "https://javdb.com/search?locale=en&q={qtext}",
    "id": "http://www.javlibrary.com/v/{qtext}?locale=en",
}

const DOMAIN = 'javdb.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'https://' + DOMAIN;

function fomartReleaseDate (val) {
    let parts = val.split("/");
    return `${parts[2].trim()}-${parts[0].trim()}-${parts[1].trim()}`;
}

function getFootprint (data) {
    return {
        "crawler": NAME,
        "id": data.title,
    }
}

function thenIfId ($, url, info) {
    if (info == null) {
        info = new MovieInfo({
            url: url,
            country: 'Japan',
            origlang: 'Japanese'
        });
    }

    let videoPanelEle = $(".video-panel-info");

    videoPanelEle.find(".panel-block").each((_, el) => {
        let ele = $(el);
        let field = ele.find("strong").text().replace(":", "");
        let value = ele.find(".value").text();

        if (field == "ID") {
            info.movid = ele.find(".value").text();
        }

        if (field == "Released Date") {
            info.releasedate = value;
            info.year = info.releasedate.substring(0, 4);
        }


        if (field == "Duration") {
            info.duration = value.replace("minute(s)", "").trim();
        }

        if (field == "Director") {
            info.director = {
                url: BASE_URL + ele.find("a").attr("href"),
                text: value
            }
        }

        if (field == "Maker") {
            info.maker = value;
        }

        if (field == "Publisher") {
            info.label = {
                url: BASE_URL + ele.find("a").attr("href"),
                text: value
            }
        }

        if (field == "Rating") {
            // ignore
        }

        if (field == "Tags") {
            ele.find("a").each((_, tag) => {
                let tagEl = $(tag);
                info.genres.push({
                    url: BASE_URL + tagEl.attr('href'),
                    text: tagEl.text()
                });
            });
        }

        if (field == "Actor(s)") {
            ele.find("a").each((_, tag) => {
                let tagEl = $(tag);
                info.actors.push({
                    url: BASE_URL + tagEl.attr('href'),
                    text: tagEl.text()
                });
            });
        }
    });

    info.origtitle = $(".container h2.title.is-4").text().replace(info.movid.toUpperCase(), "").trim();

    info.covers.push({
        url: $("img.video-cover").attr("src")
    });

    if (info.thumb.length == 0) {
        info.thumb.push({
            url: $("img.video-cover").attr("src").replace("covers", "thumbs")
        });
    }

    $(".tile-images.preview-images a.tile-item").each((_, el) => {
        info.screenshots.push({
            url: $(el).attr("href")
        });
    });

    return info;
}

function crawl (opt) {
    let url = "";
    let queryString = ""

    if (typeof opt == 'string') {
        url = opt;
        queryString = "";
    }

    if (typeof opt == 'object') {
        let type = opt.type || '';
        let qtext = opt.qtext || '';

        if (type && qtext) {
            url = TEMPLATE[type].replace('{qtext}', qtext);
            queryString = qtext;
        }
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }

    // let url_parsed = parseURL(url);
    // let urlpath = BASE_URL +
    //     url_parsed.pathname.substring(0, url_parsed.pathname.lastIndexOf('/')) + '/';

    // let matchExact = (opt.matchExact || false);

    return new Promise((resolve, reject) => {
        leech.get(url)
        .then($ => {
            if ($(".empty-message").length > 0) {

                return resolve(null);
            }

            if ($("#videos").length > 0) {

                let searchResult = new SearchResult({
                    url: url,
                    queryString: queryString,
                    footprint: getFootprint
                });

                $("#videos .grid-item").each((_, el) => {
                    let ele = $(el);
                    let info = new MovieInfo({
                        country: 'Japan',
                        origlang: 'Japanese'
                    });

                    info.movid = ele.find(".uid").text();
                    info.origtitle = ele.find(".video-title").text();
                    info.releasedate = fomartReleaseDate(ele.find(".meta").text());
                    info.year = info.releasedate.substring(0, 4);
                    info.url = BASE_URL + ele.find("a.box").attr("href") + "?locale=en";

                    info.thumb.push({
                        url: ele.find(".item-image.fix-scale-cover img").attr("data-src")
                    });

                    searchResult.results.push(info);
                });

                searchResult.more = $(".pagination-next").length > 0;

                let target = searchResult.results.filter(i => i.movid.toLowerCase() == queryString.toLocaleLowerCase());
                if (target.length == 1) {
                    return leech.get(target[0].url)
                        .then($$ => resolve(thenIfId($$, target[0].url, target[0])))
                        .catch(err => reject(err))
                }

                return resolve(searchResult);
            }

            return resolve(thenIfId($, url, null));
        })
        .catch(err => util.catchURLError(url, err, resolve, reject));;
    });
}

module.exports.crawl = crawl;
