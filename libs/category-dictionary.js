'use strict';

const util = require('./util.js');

const CATEGORIES = {
    ja : {
        // Update on 17-09-23

        // Source: http://www.caribbeancompr.com/category.html
        // Source: http://www.caribbeancom.com/category.html
        // Actress Type
        "AV女優": "AV Actress",
        "素人": "Amateur",
        "洋物/金髪": "Western / Blond Hair",
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
        "微乳": "Small Tits",
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
        "中出し": "Creampie",
        "オナニー": "Masturbation",
        "潮吹き": "Squirting",
        "生ハメ/生姦": "No Condom / Pregnant",
        "ナンパ": "Nanpa",
        "ハメ撮り": "Gonzo",
        "パイズリ": "Fucking",
        "アナル": "Anal",
        "乱交": "Orgy",
        "顔射": "Facial Cum Shot",
        "コスプレ": "Cosplay",
        "ぶっかけ": "Bukkake",
        "手コキ": "Handjob",
        "縛り": "Bondage",
        "ハード系": "Hardcore",
        "イラマチオ": "Imamachio",
        "口内発射": "Oral In The Mouth",
        "SM": "SM",
        "ごっくん": "Cum Swallowing",
        "淫語": "Dirty Talk",
        "野外露出": "Outdoor Exposure",
        "青姦": "Rape",
        "痴漢": "Molester",
        "剃毛": "Shaved",
        "カーセックス": "Car Sex",
        "クスコ": "Cusco",
        "ベスト/オムニバス": "Best Of / Various Actors",

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
        "フェラチオ": "Fellatio",
        "初裏": "Debut",
        "ロリ系": "Lolita",
        "熟女/人妻": "MILF / Housewife",
        "浴衣/着物": "Yukata / Kimono",
        "看護婦": "Nurse",
        "レズ": "Lesbian",
        "洋物": "Foreign",
        "3P": "3P",
        "洋物": "Western",
        "金髪": "Blond Hair",
        "生ハメ": "No Condom",
        "生姦": "Pregnant",
        "ベスト": "Best Of",
        "オムニバス": "Various Actors",
        "浴衣": "Yukata",
        "着物": "Kimono",
        "熟女": "MILF",
        "ザーメン": "Semen",
        "人気シリーズ": "Polular Series",


        // Source: http://www.10musume.com
        // Other
        "初心 (うぶ) 系": "Debug",
        "ギャル系": "Gal",
        "処女": "Virgin",
        "色白": "Fair Skin",
        "黒髪": "Black Hair",
        "若妻系": "Married Woman",

        // Body type
        "ぽっちゃり": "Chubby",


        // Source: http://dmm.co.jp
        // Situation
        "人妻": "Housewife",

        // Type

        // Costume

        // Genre
        "単体作品": "Solowork",
        "調教/奴隷": "Training / Slave",
        "調教": "Training",
        "奴隷": "Slave",
        "寝取り/寝取られ": "Netori / Netore",
        "寝取り": "Netori",
        "寝取られ": "Netore",
        "ドラマ": "Drama",

        // Contents Of Play
        "3P/4P": "3P / 4P",
        "4P": "4P",
        "拘束": "Restrain",
        "母乳": "Breast Milk",

        // Other
        "サンプル動画": "Sample Video",


        // Source: http://www.heyzo.com/categorys.html
        // Actress Type

        // Play Contents
        "素股": "Sumata",
        "フェラ抜き": "Fellatio",
        "口内射精": "Cum In Mouth",

        // Theme

        // Other
        "セクシー下着": "Sexy Underwear",
        "Gカップ": "G Cup",
        "尻コキ": "Shirikoki",
    }
};

function formatWord (value) {
    var p = util.split(value, ['・', '、']);
    if (p.length > 1) {
        return p.join('/');
    }

    return value;
}

module.exports = function (options) {
    var lang, word;

    if (arguments.length == 1) {
        lang = options.lang || 'en';
        word = options.word || '';
    }

    if (arguments.length == 2) {
        lang = (arguments[0] || 'en') + '';
        word = (arguments[1] || '') + '';
    }

    var word_formatted = formatWord(word);

    if (lang == 'en') {
        return word;
    }

    let dict = CATEGORIES[lang];

    if (!dict) {
        throw new Error('Language not found: ' + lang);
    }

    return dict[word_formatted] || word;
}
