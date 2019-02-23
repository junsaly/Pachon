module.exports = {
    STRAGETIES: {
        main: [
            { crawler: 'r18', condition: /^asw-\d{3}$/ },
            { crawler: 'r18', condition: /^ght-\d{3}$/ },
            { crawler: 'caribbeancom', condition: /^(carib|caribbean) \d{6}-\d{3}$/ },
            { crawler: 'caribbeancompr', condition: /^(caribpr|caribbeanpr) \d{6}_\d{3}$/ },
            { crawler: 'tokyo-hot', condition: /^tokyohot .*$/ },
            { crawler: 'pacopacomama', condition: /^paco \d{6}_\d{3}$/ },
            { crawler: 'avent', condition: /^(emp|sky|red|rhj|skyhd|pt|pb|hey|bt|drc|s2m|ssk-bd|sskj|trg|trp|pink)-\d{3}$/ },
            { crawler: 'avent', condition: /^(cwp|cwdv|cz|smd|smbd|laf|kg|dsam|shd|smr)-\d+$/ },
            { crawler: 'avent', condition: /^(mkd-s|mkbd-s)\d+$/ },
            { crawler: 'avent', condition: /^cld\d{2}$/ },
            { crawler: 'avent', condition: /^cw3d2bd-\d{2}$/ },
            { crawler: 'mgstage', condition: /^\d{3}\w+-\d+$/},
            { crawler: 'mgstage', condition: /^siro-\d+$/},
        ],
    
        default: [
            { crawler: "jcen" },
        ],
    },

    checkCondition: function (input, qtext) {
        return input.test(qtext);
    },

    getId: function (input) {
        let id = input;
        if (input.indexOf(' ') > 0) {
            let pos = input.indexOf(' ');
            id = input.substring(pos).trim();
        }

        return id;
    }
}