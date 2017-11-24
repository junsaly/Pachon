'use strict';

const clone = require('clone');
const cache = require('../config/cache.js');
const storage = require('../config/storage.js');
const leech = require('../libs/leech-promise.js');

const express = require('express');
const router  = express.Router();

router.get('/:resid', (req, res) => {
    try {
        let resid = req.params['resid'];
        let reqObj = cache.get('image', resid);
        if (reqObj) {
            let options = clone(reqObj);
            options['targets'] = [
                res,
                storage.createWritestream('images', resid),
            ];
    
            leech.pipe(options)
            .catch(err => {
                console.error(err);
                res.status(500).end();
            });
        } else {
            res.status(404).end();
        }
    } catch (ex) {
        console.error(ex);
        res.status(500).end();
    }
});

module.exports = router;
