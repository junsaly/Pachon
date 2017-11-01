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
        "美乳": "Breasts",
        "スレンダー": "Slender",
        "ロリ": "Loli",
        "ギャル": "Gal",
        "痴女": "Slut",
        "パイパン": "Shaved",
        "お姉さん": "Older Sister",
        "美尻": "Nice Bottom",
        "美脚": "Legs",
        "微乳": "Small Tits",
        "そっくりさん": "Look-Alike",
        "10代": "10'S",
        "ニューハーフ": "Shemale",
        "女子校生": "School Girls",
        "アニメ": "Anime",

        // Contents Of Play
        "69": "69",
        "フェラ": "Fellatio",
        "クンニ": "Cunnilingus",
        "バイブ": "Vibe",
        "中出し": "Creampie",
        "オナニー": "Masturbation",
        "潮吹き": "Squirting",
        "生ハメ/生姦": "No Condom / Pregnant",
        "ナンパ": "Nanpa",
        "ハメ撮り": "POV",
        "パイズリ": "Titty Fucking",
        "アナル": "Anal",
        "乱交": "Orgy",
        "顔射": "Facials",
        "コスプレ": "Cosplay",
        "ぶっかけ": "Bukkake",
        "手コキ": "Handjob",
        "縛り": "Bondage",
        "ハード系": "Hardcore",
        "イラマチオ": "Deep Throating",
        "口内発射": "Oral In The Mouth",
        "SM": "SM",
        "ごっくん": "Cum Swallowing",
        "淫語": "Dirty Talk",
        "野外露出": "Outdoor Exposure",
        "青姦": "Rape",
        "痴漢": "Molester",
        "剃毛": "Shaved",
        "カーセックス": "Car Sex",
        "クスコ": "Speculum",
        "ベスト/オムニバス": "Best Of / Various Actors",

        // Costume
        "制服": "Uniform",
        "水着": "Swimsuit",
        "ブルマ": "Bloomers",
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
        "熟女/人妻": "Mature Woman / Married Woman",
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
        "熟女": "Mature Woman",
        "ザーメン": "Semen",
        "人気シリーズ": "Polular Series",


        // Source: http://www.10musume.com
        // Other
        "初心 (うぶ) 系": "Debug",
        "ギャル系": "Gal",
        "処女": "Virgin",
        "色白": "Fair Skin",
        "黒髪": "Black Hair",
        "若妻系": "Young Wife",

        // Body type
        "ぽっちゃり": "BBW",


        // Source: http://dmm.co.jp
        // Situation
        "人妻": "Married Woman",

        // Type

        // Costume

        // Genre
        "単体作品": "Solowork",
        "調教/奴隷": "Training / Slave",
        "調教": "Training",
        "奴隷": "Slave",
        "寝取り/寝取られ": "Cuckold",
        "寝取り": "Netori",
        "寝取られ": "Netore",
        "ドラマ": "Drama",

        // Contents Of Play
        "3P/4P": "3P / 4P",
        "4P": "4P",
        "拘束": "Restraint",
        "母乳": "Breast Milk",

        // Other
        "サンプル動画": "Sample Video",


        // Source: http://www.heyzo.com/categorys.html
        // Actress Type

        // Play Contents
        "素股": "Sumata",
        "フェラ抜き": "Fellatio",
        "口内射精": "Cum In Mouth",
        "バック": "Riding",
        "手かせ": "Handjob",

        // Theme
        "店員": "Clerk",

        // Other
        "セクシー下着": "Sexy Underwear",
        "Gカップ": "G Cup",
        "尻コキ": "Shirikoki",
        "初登場": "Debug Work",
        "Fカップ": "F Cup",


        // Source: http://www.minnano-av.com
        "低身長": "Short Stature",
        "改名→移籍": "Rename to Transfer",
        "フィストファック": "Fist Sex",
        "AV女優＆ヌードモデル＆女優": "AV Actress & Nude Model & Actress",
        "ヌードモデル": "Nude Model",
        "女優": "Actress",
        "東京熱": "Tokyo-Hot",
        "グラマー": "Glamor",
        "セクシー": "Sexy",
        "陥没チクビ": "Inverted Nipple",
        "スーパーボディ": "Superbody",
        "パーフェクトボディ": "Perfect Body",
        "美巨乳": "Beautiful Breasts",
        "くびれ": "Kubire",
        "美人": "Beauty",
        "美マン": "Beautiful Pussy",
        "美乳輪": "Beautiful Areola",
        "エロボディ": "Erotic Body",
        "エロ乳首": "Erotic Nipple",
        "最強ボディ": "Strong Body",
        "引退→復活/移籍": "Retirement to Resurrection / Transfer",
        "引退": "Retirement",
        "移籍": "Transfer",
        "清楚": "Neat",
        "妹系": "Sister Family",


        // Source: http://javlibrary.com
        // Theme
        "不倫": "Affair",
        "アジア": "Asian",
        "お風呂": "Bath",
        "エステ": "Beauty Shop",
        "猟奇": "Bizarre",
        "巨乳フェチ": "Busty Fetish",
        "カップル": "Couple",
        "残虐表現": "Cruel Expression",
        "ダンス": "Dance",
        "ダーク系": "Dark System",
        "泥酔": "Dead Drunk",
        "妄想": "Delusion",
        "エロス": "Eros",
        "鬼畜系": "Evil",
        "フェチ": "Fetish",
        "フランス": "France",
        "友情": "Friendship",
        "ふたなり": "Futanari",
        "ゲイ": "Gay",
        "イメクラ": "Image Club",
        "近親相姦": "Incest",
        "韓国": "Korean",
        "脚フェチ": "Leg Fetish",
        "レズキス": "Lesbian Kiss",
        "淫乱/ハード系": "Nasty, Hardcore",
        "ノーマル": "Normal",
        "全裸": "Nude",
        "その他フェチ": "Other Fetish",
        "覗き": "Peeping",
        "企画": "Planning",
        "イタズラ": "Prank",
        "レイプ": "Rape",
        "逆ナン": "Reserved Role",
        "学園もの": "School Stuff",
        "ショタ": "Shotacon",
        "スポーツ": "Sport",
        "タレント": "Talent",
        "触手": "Tentacle",
        "話題作": "Topic Work",
        "ツンデレ": "Tsundere",
        "童貞": "Virgin Man",
        "盗撮": "Voyeur",
        "青春": "Youth",

        // Character
        "美少女": "Beautiful Girl",
        "女子アナ": "Anchorwoman",
        "黒人男優": "Black Actor",
        "キャンギャル": "Booth Girl",
        "花嫁/若妻": "Bride, Young Wife",
        "バスガイド": "Bus Guide",
        "幼なじみ": "Childhood Friend",
        "コンパニオン": "Companion",
        "コスプレイヤー": "Cosplayers",
        "令嬢": "Daughter",
        "芸能人": "Entertainer",
        "女子大生": "College Students",
        "格闘家": "Fighters",
        "フリーター": "Freeter",
        "キャバ嬢": "Hostesses",
        "アイドル": "Idol",
        "インストラクター": "Instructor",
        "女将/女主人": "Landlady, Hostess",
        "お嬢様": "Miss",
        "モデル": "Model",
        "お母さん": "Mother",
        "義母": "Mother-in-law",
        "アジア女優": "Other Asian",
        "その他学生": "Other Students",
        "お姫様": "Princess",
        "風俗嬢": "Prostitutes",
        "レースクィーン": "Race Queen",
        "秘書": "Secretary",
        "妹": "Sister",
        "家庭教師": "Tutor",
        "職業色々": "Various Professions",
        "ウェイトレス": "Waitress",
        "白人女優": "White Actress",
        "未亡人": "Widow",
        "女医": "Female Doctor",
        "女捜査官": "Female Investigator",
        "コギャル": "Young Gals",

        // Costume
        "アニメキャラクター": "Anime Characters",
        "ブレザー": "Blazer",
        "ボディコン": "Body Conscious",
        "バニーガール": "Bunny Girl",
        "ネコミミ": "Catgirl",
        "チャイナドレス": "Cheongsam",
        "コスプレ衣装": "Cosplay Costumes",
        "女装・男の娘": "Cross Dressing",
        "ドール": "Doll",
        "着エロ": "Erotic Wear",
        "くノ一": "Female Ninja",
        "女戦士": "Female Warrior",
        "ハットタイプ": "Hat Type",
        "和服/喪服": "Kimono, Mourning",
        "ニーソックス": "Knee Socks",
        "レオタード": "Leotard",
        "ランジェリー": "Lingerie",
        "ゴスロリ": "Lolita Cosplay",
        "ルーズソックス": "Loose Socks",
        "ミニスカ": "Mini Skirt",
        "ミニスカポリス": "Mini Skirt Police",
        "ミニスカート": "Miniskirt",
        "裸エプロン": "Naked Apron",
        "シスター": "Nun",
        "パンスト": "Pantyhose",
        "巫女": "Priestess",
        "セーラー服": "Sailor Suit",
        "スクール水着": "School Swimsuit",
        "学生服": "School Uniform",
        "スチュワーデス": "Stewardess",
        "パンチラ": "Underwear",

        // Body Type
        "尻フェチ": "Butt",
        "ミニ系": "Mini",
        "筋肉": "Muscle",
        "妊婦": "Pregnant Woman",
        "長身": "Tall",
        "超乳": "Ultra-Huge Tits",

        // Sex Act
        "シックスナイン": "69",
        "食糞": "Coprophagy",
        "騎乗位": "Cowgirl",
        "脱糞": "Defecation",
        "顔面騎乗": "Facesitting",
        "指マン": "Finger Fuck",
        "フィスト": "Fisting",
        "足コキ": "Footjob",
        "マッサージ": "Massage",
        "飲尿": "Piss Drinking",
        "シャワー": "Shower",
        "放尿": "Urination",

        // Sex Plays
        "凌辱": "Abuse",
        "ポルチオ": "Cervix",
        "監禁": "Confinement",
        "ドラッグ": "Drug",
        "ローター": "Egg Vibrator",
        "電マ": "Electric Massager",
        "浣腸": "Enema",
        "露出": "Exposure",
        "異物挿入": "Foreign Objects",
        "輪姦": "Gangbang",
        "羞恥": "Humiliation",
        "催眠": "Hypnosis",
        "即ハメ": "Immediate Oral",
        "ローション": "Lotion",
        "野外": "Outdoors",
        "強姦": "Rape",
        "スカトロ": "Scatology",
        "おもちゃ": "Toy",
        "脱衣": "Undressing",
        "尿道カテーテル": "Urethral Cathing",

        // Genre
        "3D": "3D",
        "4時間以上作品": "4HR+",
        "アクション": "Action",
        "アダルトアニメ": "Adult Anime",
        "成人向け映画": "Adult Movie",
        "アドベンチャー": "Adventure",
        "ベスト/総集編": "Best, Omnibus",
        "クロマキー": "Chroma Key",
        "クラシック": "Classic",
        "局部アップ": "Close Up",
        "コメディー": "Comedy",
        "カルチャー": "Culture",
        "デビュー作": "Debut",
        "デビュー作品": "Debut Production",
        "デジモ": "Digital Mosaic",
        "ドキュメント": "Documentary",
        "アクション格闘": "Fighting Action",
        "女性向け": "For Women",
        "美少女ムービー": "Girl Movie",
        "グラビア": "Gravure",
        "時代劇": "Historical Play",
        "趣味/教養": "Hobby, Culture",
        "ホラー": "Horror",
        "How To": "How To",
        "イメージビデオ": "Image Video",
        "インディーズ": "Independents",
        "インタビュー": "Interview",
        "恋愛": "Love",
        "ラブロマンス": "Love Romance",
        "ラブストーリー": "Love Story",
        "男性": "Male",
        "複数話": "Multiple Story",
        "海外輸入": "Oversea Import",
        "海外": "Overseas",
        "パロディ": "Parody",
        "サイコ/スリラー": "Psycho, Thriller",
        "R-15": "R-15",
        "R-18": "R-18",
        "復刻版": "Reprinted Edition",
        "ギリモザ": "Risky Mosaic",
        "官能作品": "Sensuality",
        "SF": "SF",
        "シミュレーション": "Simulation",
        "特撮": "Special Effects",
        "主観": "Subjectivity",
        "サスペンス": "Suspense",
        "タッチタイピング": "Touch Typing",
        "洋ピン": "US/EU Porn",
        "投稿": "User Submission",
        "VR": "VR",

        // Media
        "Blu-ray（ブルーレイ）": "Blu-ray",
        "HD": "HD",
        "DVD": "DVD",
        "microSD": "MicroSD",
        "UMD": "UMD",
        "VHS": "VHS",


        // Source: http://my.tokyo-hot.com/product/
        // Personality
        
        // Play
        "飲ザーメン": "Drinking Semen",
        "拘束具": "Restraint",
        "テコキ": "Tekki",
        "ブッカケ": "Bukkake",
        "膣内撮影": "Intravaginal Imaging",
        "二穴同時挿入": "Double Penetration",

        // Costume
        "普段着": "Casual Wear",
        "セレブ系": "Celebrity",
        "萌え系": "Moe",
        "オミズ系": "Omys",

        // Resolution

        // File Size
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
