var express = require('express');
var app = express();

var middlewareAuthentication = require('../middlewares/authentication');
var HospitalModel = require('../models/hospital');

/* ======================================
 Creando la ruta para obtener todos los hospitales
======================================*/
app.get('/', (req, res) => {
    let offset = req.query.offset || 0;
    offset = Number(offset);
    
    HospitalModel.find({})
        .populate('user', 'name email img')
        .skip(offset)
        .limit(10)
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al cargar la lista de  hospitales',
                    error: err
                });
            }
            
            HospitalModel.count({}, (err, count) => {
                res.status(200).json({
                    count,
                    ok: true,
                    hospitals: data
                });
            });
        });
});

/* ======================================
 Creando la ruta para guardar hospitales
======================================*/
app.post('/', middlewareAuthentication.verifyToken, (req, res) => {
    let body = req.body;

    let hospital = new HospitalModel({
        name: body.name,
        img: body.img,
        user: req.user._id
    });

    hospital.save((err, hospitalStored) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al crear el hospital',
                error: err
            });
        }

        res.status(201).json({
            ok: true,
            body: hospitalStored,
            /* ======================================
             Mostrando los datos de las peticion y los datos del usuario autenticado
            ======================================*/
            userToken: req.user
        });
    });

});

/* ======================================
 Creando el metodo actualizar de los hospitales
======================================*/
app.put('/:id', middlewareAuthentication.verifyToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    HospitalModel.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el hospital',
                error: err
            });
        } else if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: `Error el hospital con el ${id} no existe`,
                error: {
                    message: `Error el hospital con el ${id} no existe`
                }
            });
        }

        hospital.name = body.name;
        hospital.user = req.user._id;

        hospital.save((err, hospitalPut) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el hospital',
                    error: err
                });
            } else if (!hospitalPut) {
                return res.status(400).json({
                    ok: false,
                    message: `Error el hospital con el ${id} no existe`,
                    error: {
                        message: `Error el hospital con el ${id} no existe`
                    }
                });
            }
            res.status(201).json({
                ok: true,
                body: hospitalPut
            });
        });
    });
});

/* ======================================
 Creando el metodo para eliminar hospitales
======================================*/

app.delete('/:id', middlewareAuthentication.verifyToken, (req, res) => {
    let id = req.params.id;

    HospitalModel.findByIdAndRemove(id, (err, hospitalDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error no se pudo completar su solicitud',
                errors: err
            });
        }

        if (!hospitalDelete) {
            return res.status(400).json({
                ok: false,
                message: `Error el hospital con el ${id} no existe`,
                errors: {
                    message: `Error el hospital con el ${id} no existe`
                }
            });
        }
        res.status(201).json({
            ok: true,
            body: hospitalDelete
        });

    });
});

module.exports = app;