module.exports = {
    STRAGETIES: {
        main: [
            { crawler: 'r18', condition: /^asw-\d{3}$/ },
            { crawler: 'r18', condition: /^ght-\d{3}$/ },
            { crawler: 'caribbeancom', condition: /^(carib|caribbean) \d{6}-\d{3}$/ },
            { crawler: 'caribbeancompr', condition: /^(caribpr|caribbeanpr) \d{6}_\d{3}$/ },
            { crawler: 'tokyo-hot', condition: /^tokyohot .*$/ },
            { crawler: 'pacopacomama', condition: /^paco \d{6}_\d{3}$/ },
            { crawler: 'avent', condition: /^(sky|red|rhj|skyhd|pt|pb|hey|bt|drc|s2m)-\d{3}$/ },
            { crawler: 'avent', condition: /^(cwp|cwdv|cz|smd|laf|kg|dsam)-\d+$/ },
            { crawler: 'avent', condition: /^mkd-s\d+$/ },
        ],
    
        all: [
            { crawler: "r18" },
            { crawler: "dmm" },
            { crawler: "javlibrary" },
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