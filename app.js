const mongoose = require('mongoose');
var express = require('express');
var app = express();

// conexion con mongo
mongoose.openUri('mongodb://localhost:27017/hospitalDB', (err, resp) => {
    if (err) throw err;
    console.log('Mongoose is running');
    
});

app.get('/', (req, res) => {
    res.send().json({
        ok: true,
        message: 'Hello world'
    });
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
