var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

var express = require('express');
var app = express();

var bodyParser = require('body-parser');

/* ======================================
 Endpoints de las rutas de la api
======================================*/
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var hospitalRoutes = require('./routes/hospital');
var doctorRoutes = require('./routes/doctor');
var loginAuthenticate = require('./routes/login');
var searchRoute = require('./routes/search');
var uploadRoute = require('./routes/upload');


/* ======================================
 Creando middlewares
======================================*/

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/user', userRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/doctor', doctorRoutes);
app.use('/login', loginAuthenticate);
app.use('/', appRoutes);
app.use('/search', searchRoute);
app.use('/upload', uploadRoute);


/* ======================================
 Creando conexiones a mongo y node
======================================*/
mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true },

    (err, resp) => {
        if (err) throw err;
        console.log('Conexion establecida');

        app.listen(3000, () => {
            console.log('Example app listening on port 3000!');
        });
    }
);