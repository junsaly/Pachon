'use strict';

const app = require('./config/server.js');
const port = app.get('port');

app.listen(port, function () {
    console.log('Server is listening at ' + port + '...');
});

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
