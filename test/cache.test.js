'use strict';

const expect = require('chai').expect;

describe('node-cache', function () {

    this.timeout(0);

    it('should auto delete if expired', function (done) {
        var NodeCache = require('node-cache');
        var mycache = new NodeCache( { stdTTL: 2, checkperiod: 1 } );
        mycache.on('set', function (key, value) {
            console.log('set: ' + key + ' ' + value);
        });

        mycache.on('del', function (key, value) {
            console.log('del: ' + key + ' ' + value);
        });

        mycache.on('expired', function (key, value) {
            console.log('expired: ' + key + ' ' + value);
        });

        mycache.set('a', 1);

        setTimeout(() => {
            expect(mycache.get('a')).to.be.undefined;
            done();
        }, 5000);
    })

    it('should auto delete if expired', function (done) {
        var cache = require('../config/cache.js');

        cache.set('test', 'tc1', 1);
        setTimeout(() => {
            expect(cache.get('test', 'tc1')).to.be.undefined;
            done();
        }, 5000);
    })
})
