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
            
            var detailDataTableRows = $('.detail_data table tr');

            // info.actors.push({
            //     text: detailDataTableRows.eq(0).find('td').text().trim()
            // })
            
            info.maker = detailDataTableRows.eq(1).find('td').text().trim();
            
            info.duration = formatDuration(detailDataTableRows.eq(2).find('td').text().trim());
            
            // info.title = detailDataTableRows.eq(3).find('td').text().trim()

            info.releasedate = formatReleaseDate(detailDataTableRows.eq(4).find('td').text().trim());

            info.year = info.releasedate.slice(0, 4)
            
            info.series = {
                url: BASE_URL + detailDataTableRows.eq(5).find('td a').attr('href'),
                text: detailDataTableRows.eq(5).find('td a').text().trim(),
            };
            
            if (detailDataTableRows.eq(6).find('td').children().length > 0) {
                throw new Error('This movie has label. Implement it!')
            }

            info. description = $('#introduction p.introduction').text().trim();

            var movid_parts = info.movid.toLowerCase().split('-');
            var maker_id = detailDataTableRows.eq(1).find('td a').attr('href').trim().split('=').pop();

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
