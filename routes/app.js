var express = require('express');
var app = express();

// endpoint
app.get('/', (req, res) => {
    res.send('Get general');
});

module.exports = app;