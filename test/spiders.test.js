'use strict';

const chai = require('chai');
var expect = require('chai').expect;

describe('spiders/... test suite', function() {

    // disable time-out
    this.timeout(0);

    afterEach(function() {
        console.log();
    })

    let test = function (spider, url) {
        describe('spiders.' + spider.name() + ' test cases', function() {
            it('should return data', function() {
                
                return spider.crawl(url)
                .then(data => {
                    expect(data).to.not.be.null;
                    if (data) {
                        console.log(JSON.stringify(data));
                    }
                });
            })
        });
    };

    test.only = function (spider, url) {
        describe.only('spiders.' + spider.name() + ' test cases', function() {
            it('should return data', function() {
                
                return spider.crawl(url)
                .then(data => {
                    expect(data).to.not.be.null;
                    if (data) {
                        console.log(JSON.stringify(data));
                    }
                });
            })
        });
    };

    let spiders = require('../libs/spiders');
    test(spiders['minnano-av'], {qtext: '竹内しずか【登', type: 'search'});
    test(spiders['caribbeancom'], {qtext: '091317-498', type: 'search'});
    test(spiders['heyzo'], {qtext: '0585', type: 'search'});
    test(spiders['heyzo'], {qtext: '0727', type: 'search'});
    test(spiders['dmm'], {qtext: 'AVOP-210', type: 'search'});
    test(spiders['dmm'], {qtext: 'AVOP 2', type: 'search'});
    test(spiders['r18'], {qtext: '1sw00261', type: 'id'});
    test(spiders['r18'], {qtext: 'mide-412', type: 'search'});
    test(spiders['javlibrary'], {qtext: 'avop021', type: 'search', lang: 'en'});
    test(spiders['heydouga'], {qtext: '4037/348'});
    test(spiders['heydouga'], {qtext: '4017/245'});
    test(spiders['dmm'], {qtext: 'xrw-011', type: 'search'});
    test(spiders['tokyo-hot'], {qtext: 'n0900', type: 'search'});
    test(spiders['avent'], {qtext: 'pink-019', type: 'search'});
    test(spiders['r18'], {qtext: 'kk-016', type: 'search'});
    test(spiders['pacopacomama'], {qtext: '022018_224', type: 'search'});
});
