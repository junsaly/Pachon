const SpiderQueen = require('../libs/spider-queen.js');
const { HumanName, HumanInfo } = require('../models/types.js');
const { MovieInfo } = require('../models/types.js');
const { SearchResult } = require('../models/types.js');
const cache = require('../config/cache.js');
const util = require('../libs/util.js');

const express = require('express');
const router  = express.Router();

router.get('/movie/search', (req, res) => {
    const type = 'movie';
    let query = util.replaceAll(req.query['q'], '+', ' ');

    SpiderQueen.crawl(query, {
        target: 'movie',
        type: 'search'
    })
    .then(data => {
        let data_cached = util.cacheImageURLs(data);

        if (data_cached instanceof MovieInfo) {
            if (data_cached.posters.length == 0) {
                data_cached.posters.push(
                    '/assets/images/noimagepl.gif'
                )
            }

            res.jsonp(data_cached);
        }

        else if (data_cached instanceof SearchResult) {
            data_cached = util.cacheURLs(data_cached);
            if (data_cached.results.length > 0) {
                data_cached.results.filter(v => v.posters.length == 0)
                .forEach(mov => {
                    mov.posters.push(
                        '/assets/images/noimagepl.gif'
                    )
                });

                res.jsonp(data_cached);
            }
            else {
                res.status(404).end();
            }
        }

        else {
            res.status(404).end();
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).end();
    });
})

router.get('/movie/:infoid', (req, res) => {
    const infoid = util.replaceAll(req.params['infoid'], '+', ' ');

    let footprint = cache.get('id', infoid);
    if (footprint) {
        SpiderQueen.crawl(footprint.id, {
            target: 'movie',
            type: 'id',
            assign: footprint.crawler,
        })
        .then(data => {
            let data_cached = util.cacheImageURLs(data);

            if (data_cached instanceof MovieInfo) {
                if (data_cached.posters.length == 0) {
                    data_cached.posters.push(
                        '/assets/images/noimagepl.gif'
                    );
                }
                res.jsonp(data_cached);

            } else {
                res.status(404).end();
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).end();
        });

    } else {
        res.status(404).end();
    }
})

router.get('/human/search', (req, res) => {
    const type = 'human';
    var query = util.replaceAll(req.query['q'], '+', ' ');

    SpiderQueen.crawl(query, {
        target: 'human',
        type: 'search'
    })
    .then(data => {
        let data_cached = util.cacheImageURLs(data);

        if (data_cached instanceof HumanInfo) {
            if (data_cached.photos.length == 0) {
                data_cached.photos.push(
                    '/assets/images/noimageps.gif'
                );
            }

            res.jsonp(data_cached);

        } else if (data_cached instanceof SearchResult) {
            data_cached = util.cacheURLs(data_cached);
            data_cached.results.filter(v => v.photos.length == 0).forEach(d => {
                d.photos.push(
                    '/assets/images/noimageps.gif'
                );
            })

            if (data_cached.results.length == 0) {
                res.status(404).end();
            } else {
                res.jsonp(data_cached);
            }

        } else {
            res.status(404).end();
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).end();
    });
})

router.get('/human/:infoid', (req, res) => {
    const infoid = util.replaceAll(req.params['infoid'], '+', ' ');

    let footprint = cache.get('id', infoid);
    if (footprint) {
        SpiderQueen.crawl(footprint.id, {
            target: 'human',
            type: 'id',
            assign: footprint.crawler,
        })
        .then(data => {
            let data_cached = util.cacheImageURLs(data);

            if (data_cached instanceof HumanInfo) {
                if (data_cached.photos.length == 0) {
                    data_cached.photos.push(
                        '/assets/images/noimageps.gif'
                    );
                }
                res.jsonp(data_cached);

            } else {
                res.status(404).end();
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).end();
        });

    } else {
        res.status(404).end();
    }
})

module.exports = router;
