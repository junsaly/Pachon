'use strict';

const chai = require('chai');
const expect = require('chai').expect;

const types = require('../models/types.js');

describe('util.js test suite', function() {
    
    const util = require('../libs/util.js');

    describe('syncObjects test cases', function () {
        it('should equal', function() {
            let des = {a:null, b:'1'};
            let src = {a:'nam',b:'1'};
            expect(util.syncObjects(des, src)).to.deep.equal({a:'nam',b:'1'});
        });

        it('should equal', function() {
            let des = {a:null, b:'1',c:[]};
            let src = {a:'nam',b:'2',c:[1,2,3]};
            expect(
                util.syncObjects(des, src)
            ).to.deep.equal({
                a: 'nam', 
                b: '1', 
                c: [1,2,3]
            });
        });

        it('should equal', function() {
            let des = {a:'',  b:'1',c:[],     d:{a:null,b:0,c:3}};
            let src = {a:null,b:'2',c:[1,2,3],d:{a:'1', b:2,c:0}};
            expect(
                util.syncObjects(des, src)
            ).to.deep.equal({
                a: '', 
                b: '1', 
                c: [1,2,3],
                d: {a:'1',b:2,c:3}
            });
        });

        it('should equal', function() {
            let des = {a:'',b:'1',c:[],d:{a:null,b:0,c:3}};
            let src = null;
            expect(
                util.syncObjects(des, src)
            ).to.equal(des);
        });

        it('should be thrown', function() {
            let des = 2;
            let src = 1;
            expect(
                () => util.syncObjects(des, src)
            ).to.throw();
        });

        it('should be thrown', function() {
            let des = "{a:'',b:'1',c:[],d:{a:null,b:0,c:3}}";
            let src = 1;
            expect(
                () => util.syncObjects(des, src)
            ).to.throw();
        });

        it('should be thrown', function() {
            let des = "{a:'',b:'1',c:[],d:{a:null,b:0,c:3}}";
            let src = "1";
            expect(
                () => util.syncObjects(des, src)
            ).to.throw();
        });

        it('should be thrown', function() {
            let des = null;
            let src = {a:null,b:'2',c:[1,2,3],d:{a:'1', b:2,c:0}};
            expect(
                () => util.syncObjects(des, src)
            ).to.throw();
        });

        it('should be thrown', function() {
            let des = [];
            let src = [1, 2, 3];
            expect(
                () => util.syncObjects(des, src)
            ).to.throw();
        });

        it('should equal', function() {
            let des = {a:'',  b:'1',c:[],     d:{a:null,b:0,c:3,d:'nam'},e:1};
            let src = {a:null,b:'2',c:[1,2,3],d:{a:'1', b:2,c:0,d:1},    e:{a:'1'}};
            expect(
                util.syncObjects(des, src)
            ).to.deep.equal({
                a: '', 
                b: '1', 
                c: [1,2,3],
                d: {a:'1',b:2,c:3,d:'nam'},
                e: 1
            });
        });

        it('should equal', function() {
            let des = {a:'',  b:'1',c:[],     d:{a:null,b:0,c:3,d:'nam'},e:{a:'1'}};
            let src = {a:null,b:'2',c:[1,2,3],d:{a:'1', b:2,c:0,d:1},    e:1};
            expect(
                util.syncObjects(des, src)
            ).to.deep.equal({
                a: '', 
                b: '1', 
                c: [1,2,3],
                d: {a:'1',b:2,c:3,d:'nam'},
                e: {a:'1'}
            });
        });
    });
});
