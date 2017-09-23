'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = 'caribbeancompr';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://www.caribbeancompr.com/moviepages/{qtext}/index.html",
}

const DOMAIN = 'www.caribbeancompr.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

const CATEGORIES = {
    // Update At 17-09-23 @ http://www.caribbeancompr.com/category.Html
    // Actress Type
    "AV女優": "AV Actress",
    "素人": "Amateur",
    "洋物/金髪": "Western Objects / Blond Hair",
    "巨乳": "Big Tits",
    "美乳": "Beautiful Breast",
    "スレンダー": "Slender",
    "ロリ": "Loli",
    "ギャル": "Gal",
    "痴女": "Slut",
    "パイパン": "Shaved",
    "お姉さん": "Older Sister",
    "美尻": "Nice Bottom",
    "美脚": "Legs",
    "微乳": "Small Milk",
    "そっくりさん": "Same-Sick",
    "10代": "10'S",
    "ニューハーフ": "Shemale",
    "女子校生": "Schoolgirl",
    "アニメ": "Anime",

    // Contents Of Play
    "69": "69",
    "フェラ": "Fellatio",
    "クンニ": "Cunni",
    "バイブ": "Vibe",
    "中出し": "Cum Inside",
    "オナニー": "Masturbation",
    "潮吹き": "Squirting",
    "生ハメ・生姦": "Raw Slug / Fuck",
    "ナンパ": "Nanpa",
    "ハメ撮り": "Gonzo",
    "パイズリ": "Fucking",
    "アナル": "Anal",
    "乱交": "Orgy",
    "顔射": "Facial Cum Shot",
    "コスプレ": "Cosplay",
    "ぶっかけ": "Bukkake",
    "手コキ": "Handjob",
    "縛り(": "Tie Down",
    "ハード系": "Hard System",
    "イラマチオ": "Imamachio",
    "口内発射": "Oral In The Mouth",
    "SM": "SM",
    "ごっくん": "Cum Swallowing",
    "淫語": "Language",
    "野外露出": "Outdoor Exposure",
    "青姦": "Aoi",
    "痴漢": "Molester",
    "剃毛": "Shave",
    "カーセックス": "Car Sex",
    "クスコ": "Cusco",
    "ベスト/オムニバス": "Best / Va",

    // Costume
    "制服": "Uniform",
    "水着": "Swimming Suit",
    "ブルマ": "Bulma",
    "浴衣/着物": "Yukata / Kimono",
    "ナース": "Nurse",
    "メイド": "Maid",
    "女教師": "Female Teacher",
    "OL": "OL",
    "めがね": "Glasses",
    "エプロン": "Apron",
    "ボンテージ": "Bondage",
    
    // Other
    "オリジナル動画": "Original Video",
    "フェラチオ": "Blow Job",
    "初裏": "Debut",
    "ロリ系": "Lolita",
};

function formatTitle (val) {
    return val.replace(BASE_URL, '')
        .replace('/moviepages/', '')
        .replace('/index.html', '')
        .trim();
}

function formatPoster (val) {
    let url = val.replace('index.html', '');
    return url + 'images/l_l.jpg';
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
            if ($('title').text() == 'カリビアンコムプレミアム 単品購入') {
                resolve(null);
            } else {
                let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });

                info.title = 'Caribbeancompr ' + formatTitle(url);
                info.origtitle = $('div.video-detail > h1').text().trim();

                info.releasedate = $('div.movie-info dt:contains("販売日:")').next().text();
                info.year = info.releasedate.substring(0, 4);

                info.duration = $('div.movie-info dt:contains("再生時間:")').next().text();

                info.maker = 'カリビアンコムプレミアム';

                $('dl.movie-info-cat dd').each((i, el) => {
                    let ele = $(el);
                    let genre = {
                        url: BASE_URL + ele.find('a').attr('href'),
                        text: CATEGORIES[ele.text().trim()] || ele.text().trim(),
                    };

                    info.genres.push(genre);
                });

                if ($('dt:contains("出演:")').length > 0) {
                    $('dt:contains("出演:")').next().find('a').each((i, el) => {
                        let ele = $(el);
                        let actor = {
                            url: BASE_URL + ele.attr('href'),
                            text: ele.text(),
                        }

                        info.actors.push(actor);
                    });
                }

                info.description = $('div.movie-comment > p').text().trim();

                if ($('dt:contains("シリーズ:")').length > 0) {
                    let ele = $('dt:contains("シリーズ:")').next().find('a');
                    info.series = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }
                }

                if ($('dt:contains("ユーザー評価:")').length > 0) {
                    let ele = $('dt:contains("ユーザー評価:")').next()
                    info.rating = ele.text().trim().length * 2;
                }

                if ($('dt:contains("スタジオ:")').length > 0) {
                    let ele = $('dt:contains("スタジオ:")').next().find('a')
                    info.provider = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }
                }

                info.posters.push({
                    url: formatPoster(url)
                });

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
    });
}

module.exports.crawl = crawl;
