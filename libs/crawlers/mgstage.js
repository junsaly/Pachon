'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');
const util = require('../util.js');

const NAME = 'mgstage';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = "https://www.mgstage.com/product/product_detail/{qtext}/";

const DOMAIN = 'www.mgstage.com';
module.exports.domain = function () {
    return DOMAIN;
}

const LangMap = {
    'actors': '出演',
    'maker': 'メーカー',
    'duration': '収録時間',
    'title': '品番',
    'releasedate': '配信開始日',
    'series': 'シリーズ',
    'label': 'レーベル',
}

const BASE_URL = 'https://' + DOMAIN;

function formatReleaseDate (val) {
    return util.replaceAll(val, '/', '-');
}

function formatDuration (rawText) {
    let minutes = parseInt(rawText.replace('min', ''));
    let hours = Math.floor(minutes / 60);
    minutes = minutes - hours * 60;

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }

    return hours + ':' + minutes + ':' + '00';
}

function crawl (opt) {
    let url = "";
    if (typeof opt == 'string') {
        url = opt;
    }

    if (typeof opt == 'object') {
        let qtext = (opt.qtext || '').toUpperCase();
        if (qtext) {
            url = TEMPLATE.replace('{qtext}', qtext);
        }
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }

    return new Promise((resolve, reject) => {
        leech.get({
            'url': url,
            'cookie': 'adc=1'
        })
        .then($ => {
            if ($.getCurrentURL() === "https://www.mgstage.com/") {
                return resolve(null); // NOT FOUND
            }

            var info = new MovieInfo({ 
                url: url, 
                country: 'Japan', 
                origlang: 'Japanese',
                movid: opt.qtext.toUpperCase()
            });

            info.title = info.movid;
            info.origtitle = $('.common_detail_cover h1').text().trim();
            
            var detail_tr = $('.detail_data table tr');
            var get_detail_data = function (field) {
                return detail_tr.find(`th:contains("${field}")`).next()
            }
            
            // info.actors.push({
            //     text: get_detail_data(LangMap.actors).text().trim()
            // })
            
            info.maker = get_detail_data(LangMap.maker).text().trim();
            
            info.duration = formatDuration(get_detail_data(LangMap.duration).text().trim());
            
            // info.title = get_detail_data(LangMap.title).text().trim()

            info.releasedate = formatReleaseDate(get_detail_data(LangMap.releasedate).text().trim());

            info.year = info.releasedate.slice(0, 4)

            info.genres.push({
                url: "#",
                text: 'Amateur',
            });
            
            info.series = {
                url: BASE_URL + get_detail_data(LangMap.series).find('a').attr('href'),
                text: get_detail_data(LangMap.series).text().trim(),
            };
            
            if (get_detail_data(LangMap.label).children().length > 0) {
                info.label = {
                    url: BASE_URL + get_detail_data(LangMap.label).find('a').attr('href'),
                    text: get_detail_data(LangMap.label).text().trim(),
                }
            }

            info. description = $('#introduction p.introduction').text().trim();

            var movid_parts = info.movid.toLowerCase().split('-');
            var maker_id = get_detail_data(LangMap.maker).find('a').attr('href').trim().split('=').pop();

            info.covers.push({
                url: `https://image.mgstage.com/images/${maker_id}/${movid_parts[0]}/${movid_parts[1]}/pb_e_${info.movid.toLowerCase()}.jpg`
            });

            info.thumb.push({
                url: `https://image.mgstage.com/images/${maker_id}/${movid_parts[0]}/${movid_parts[1]}/pf_t1_${info.movid.toLowerCase()}.jpg`
            });

            for (var i = 0; i < $('#sample-photo dd li').length; i++) {
                info.screenshots.push({
                    url: `https://image.mgstage.com/images/${maker_id}/${movid_parts[0]}/${movid_parts[1]}/cap_e_${i}_${info.movid.toLowerCase()}.jpg`
                })
            }

            return resolve(info);
        })
        .catch(err => util.catchURLError(url, err, resolve, reject));
    });
}

module.exports.crawl = crawl;
