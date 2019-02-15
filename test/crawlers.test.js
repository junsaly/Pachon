'use strict';

const chai = require('chai');
var expect = require('chai').expect;

describe('crawlers/... test suite', function() {

    // disable time-out
    this.timeout(0);

    afterEach(function() {
        console.log();
    })

    let test = function (crawler, url) {
        describe('crawlers.' + crawler.name() + ' test cases', function() {
            it('should return data', function() {
                
                return crawler.crawl(url)
                .then(data => {
                    expect(data).to.not.be.null;
                    if (data) {
                        console.log(JSON.stringify(data));
                    }
                });
            })
        });
    };

    test.only = function (crawler, url) {
        describe.only('crawlers.' + crawler.name() + ' test cases', function() {
            it('should return data', function() {
                
                return crawler.crawl(url)
                .then(data => {
                    expect(data).to.not.be.null;
                    if (data) {
                        console.log(JSON.stringify(data));
                    }
                });
            })
        });
    };

    let crawlers = require('../libs/crawlers');
    test(crawlers['10musume'], 'http://www.10musume.com/moviepages/060317_01/index.html');
    test(crawlers['1pondo'], 'https://www.1pondo.tv/movies/010117_001/');
    test(crawlers['avent'], 'http://www.aventertainments.com/product_lists.aspx?product_id=109021&languageID=1&dept_id=29');
    test(crawlers['avent'], 'http://www.aventertainments.com/search_Products.aspx?languageID=1&keyword=pink-019&searchby=keyword');
    test(crawlers['caribbeancom'], 'https://www.caribbeancom.com/moviepages/091317-498/index.html');
    test(crawlers['caribbeancom-en1'], 'https://www.caribbeancom.com/eng/moviepages/091317-498/index.html');
    test(crawlers['caribbeancom-en2'], 'https://en.caribbeancom.com/eng/moviepages/091317-498/index.html');
    test(crawlers['caribbeancompr'], 'http://www.caribbeancompr.com/moviepages/092916_003/index.html');
    test(crawlers['dmm'], 'http://unblockdmm.com/browse.php?u=http://www.dmm.co.jp/mono/dvd/-/detail/=/cid=143avop021');
    test(crawlers['dmm'], 'http://unblockdmm.com/browse.php?u=http://www.dmm.co.jp/mono/dvd/-/detail/=/cid=18mstg003/?i3_ref=search&i3_ord=2&b=0');
    test(crawlers['dmm'], 'http://unblockdmm.com/browse.php?u=http://www.dmm.co.jp/search/=/searchstr=abp%202/analyze=V1EBDlYPUwI_/limit=30/sort=date');
    test(crawlers['heyzo'], 'http://www.heyzo.com/moviepages/0356/index.html');
    test(crawlers['heyzo-en'], 'http://en.heyzo.com/moviepages/0356/index.html');
    test(crawlers['heyzo-en'], 'http://en.heyzo.com/moviepages/1394/index.html');
    test(crawlers['javlibrary'], 'http://www.javlibrary.com/en/?v=javliobuzi');
    test(crawlers['javlibrary'], 'http://www.javlibrary.com/en/vl_searchbyid.php?keyword=mad-08');
    test(crawlers['javlibrary'], 'http://www.javlibrary.com/ja/?v=javli43g5u');
    test(crawlers['javmodel'], 'http://javmodel.com/jav/airu-oshima/');
    test(crawlers['minnano-av'], 'http://www.minnano-av.com/actress300706.html');
    test(crawlers['pacopacomama'], 'http://www.pacopacomama.com/moviepages/012018_210/index.html');
    test(crawlers['pacopacomama-en'], 'http://en.pacopacomama.com/eng/moviepages/022018_224/index.html');
    test(crawlers['r18'], 'http://www.r18.com/common/search/searchword=DKSW-261/');
    test(crawlers['r18'], 'http://www.r18.com/common/search/searchword=Sw-261/');
    test(crawlers['tokyo-hot'], {"qtext": "6232", "type": "id", "lang": "ja"});
    test(crawlers['wap'], 'つぼみ');
    test(crawlers['mgstage'], {"qtext": "200GANA-1637"});
});
