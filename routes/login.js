var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');


var CONFIG = require('../config/config');


var app = express();
var UserModel = require('../models/user');

/* ======================================
 Autenticacion con google
======================================*/
app.post('/google', (req, res) => {

    const client = new OAuth2Client(CONFIG.CLIENT_ID);

    let token = req.body.token || '';

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CONFIG.CLIENT_ID
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        UserModel.findOne({ email: payload.email }, (err, user) => {
            
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'No existe un usuario con estas credenciales'
                });
            }

            if (user) {
                if (!user.google) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Debe autenticarse normal'
                    });
                } else {
                    /* ======================================
         creando el token
        ======================================*/
                    user.password = ':)'; // ocultando el password

                    let token = jwt.sign(
                        { user },
                        SEED,
                        { expiresIn: 14400 } // 4 horas de vigencia === 14400
                    );

                    res.status(200).json({
                        ok: true,
                        token,
                        id: user._id,
                        user
                    });
                }
            } else {
                // en caso de que no exista 
                let userNew = new UserModel();

                userNew.name = payload.name;
                userNew.email = payload.email;
                userNew.password = ':)';
                userNew.img = payload.picture;
                userNew.google = true;

                userNew.save((err, userStore) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err,
                            message: 'Error al crear el usuario'
                        });
                    }
                    /* ======================================
            creando el token
           ======================================*/
                    userStore.password = ''; // ocultando el password

                    let token = jwt.sign(
                        { user },
                        SEED,
                        { expiresIn: 14400 } // 4 horas de vigencia === 14400
                    );

                    res.status(200).json({
                        ok: true,
                        token,
                        id: userStore._id,
                        userStore
                    });
                });
            }
        });
    }
    verify().catch(error => {
        return res.status(400).json({
            ok: false,
            message: 'Token invalido'
        });
    });
});

/* ======================================
 Autenticacion normal
======================================*/
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
                message: `Crendenciales incorrectas --email`,
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
                message: `Crendenciales incorrectas --password`,
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
            ok: true,
            token,
            id: user._id,
            user
        });
    });
});

module.exports = app;