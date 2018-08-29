var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var app = express();

var UserModel = require('../models/user');
var middlewareAuthentication = require('../middlewares/authentication')

/* ======================================
 Creando endpoint para acceder a los usuarios
======================================*/
app.get('/', (req, res) => {
    UserModel.find({}, 'id name email role img', (err, data) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar la lista de  usuarios',
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            users: data
        });
    });
});


/* ======================================
 Creando endpoint para ingresar usuarios
======================================*/

app.post('/', middlewareAuthentication.verifyToken , (req, res) => {
    // falta comprobar que la contraseña no este vacia
    let body = req.body;

    let user = new UserModel({
        name: body.name,
        email: body.email,
        img: body.img,
        role: body.role,
        password: bcrypt.hashSync(body.password, 10)
    });

    user.save((err, userStored) => {       
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear el usuario',
                error: err
            });
        }
        res.status(201).json({
            ok: true,
            body: userStored,
            /* ======================================
             Mostrando los datos de las peticion y los datos del usuario autenticado
            ======================================*/
            userToken: req.user
            
        });
    });
});

/* ======================================
 Creando el metodo actualizar de los usuarios
======================================*/
app.put('/:id', middlewareAuthentication.verifyToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    UserModel.findById(id, 'id name email role img', (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el usuario',
                error: err
            });
        } else if (!user) {
            return res.status(400).json({
                ok: false,
                message:  `Error el usuario con el ${id} no existe`,
                error: {
                    message: `Error el usuario con el ${id} no existe`
                }
            });
        }

        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save((err, userPut) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el usuario',
                    error: err
                });
            } else if (!user) {
            return res.status(400).json({
                ok: false,
                message:  `Error el usuario con el ${id} no existe`,
                error: {
                    message: `Error el usuario con el ${id} no existe`
                }
            });
        }
            res.status(201).json({
                ok: true,
                body: userPut
            });
        });
    });
});

/* ======================================
 Creando el metodo para eliminar usuarios
======================================*/

app.delete('/:id', middlewareAuthentication.verifyToken, (req, res) =>{
    let id = req.params.id;

    UserModel.findByIdAndRemove(id, (err, userDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error no se pudo completar su solicitud',
                errors: err
            });
        } 
        
        if (!userDelete) {
            return res.status(400).json({
                ok: false,
                message:  `Error el usuario con el ${id} no existe`,
                errors: {
                    message: `Error el usuario con el ${id} no existe`
                }
            });
        }
        res.status(201).json({
            ok: true,
            body: userDelete
        });

    });
});
module.exports = app;