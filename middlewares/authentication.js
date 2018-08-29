var jwt = require('jsonwebtoken');
var SEED = require('../config/config');

/* ======================================
 Verificar token
======================================*/
 exports.verifyToken = (req, res, next) => {
    let token = req.query.token;
    jwt.verify(token, SEED, (err, decode) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token incorrecto',
                error: err
            }); 
        }
        req.user = decode.user;
        next();
    });
 }

