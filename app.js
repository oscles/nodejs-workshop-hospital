var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

var express = require('express');
var app = express();


var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


/* ======================================
 Endpoints de las rutas de la api
======================================*/
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginAuthenticate = require('./routes/login');


/* ======================================
 Creando middlewares de las rutas de la api
======================================*/
app.use('/user', userRoutes);
app.use('/login', loginAuthenticate);
app.use('/', appRoutes);


/* ======================================
 Creando conexiones a mongo y node
======================================*/
mongoose.connect('mongodb://localhost:27017/hospitalDB',
    { useNewUrlParser: true },

    (err, resp) => {
        if (err) throw err;
        console.log('Conexion establecida');

        app.listen(3000, () => {
            console.log('Example app listening on port 3000!');
        });
    }
);