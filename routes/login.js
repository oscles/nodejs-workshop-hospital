var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config');

var app = express();
var UserModel = require('../models/user');

app.post('/', (req, res) => {
    let body = req.body;

    UserModel.findOne({ email: body.email }, (err, user) => {
        /* ======================================
         comprobando que no hayan errores del motor
        ======================================*/
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error no se pudo completar su solicitud',
                errors: err
            });
        } 
        /* ======================================
         comprobamos que exista el usuario
        ======================================*/
        if (!user) {
            return res.status(400).json({
                ok: false,
                message:  `Crendenciales incorrectas --email`,
                errors: {
                    message: `Crendenciales incorrectas --email`
                } 
            });
        }
        /* ======================================
         comprobamos que las contraseñas sean iguales
        ======================================*/
        if (bcrypt.compareSync(body.password, user.password)) {
            return res.status(400).json({
                ok: false,
                message:  `Crendenciales incorrectas --password`,
                errors: {
                    message: `Crendenciales incorrectas --password`
                }
            });
        }
        /* ======================================
         creando el token
        ======================================*/
        user.password = ''; // ocultando el password

        let token = jwt.sign(
            { user }, 
            SEED,
            { expiresIn: 14400 } // 4 horas de vigencia === 14400
        );

        res.status(200).json({
            ok:true,
            token,
            id: user._id,
            user
        });
    });
});

module.exports = app;