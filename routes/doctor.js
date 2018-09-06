var express = require('express');
var app = express();

var middlewareAuthentication = require('../middlewares/authentication');
var DoctorModel = require('../models/doctor');

/* ======================================
 Creando la ruta para obtener todos los doctores
======================================*/
app.get('/', (req, res) => {

    let offset = req.query.offset || 0;

    DoctorModel.find({})
        /* ======================================
         populate() muestra los datos de los objetos foraneos
         limit(number) permite mostrar cierta cantidad de registros
         skip() va saltando de acuerdo al numero que le pasemos
        ======================================*/
        .skip(Number(offset))
        .limit(10)
        .populate('user', 'name img email')
        .populate('hospital')
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al cargar la lista de  doctores',
                    error: err
                });
            }
            
            DoctorModel.count({}, (err, count) => {
                res.status(200).json({
                    count,
                    ok: true,
                    doctors: data
                });
            });
        });
});

/* ======================================
 Creando la ruta para guardar doctores
======================================*/
app.post('/', middlewareAuthentication.verifyToken, (req, res) => {
    let body = req.body;

    let doctor = new DoctorModel({
        name: body.name,
        img: body.img,
        hospital: body.hospital,
        user: req.user._id
    });

    doctor.save((err, doctorStored) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al crear el doctor',
                error: err
            });
        }

        res.status(201).json({
            ok: true,
            body: doctorStored,
            /* ======================================
             Mostrando los datos de las peticion y los datos del usuario autenticado
            ======================================*/
            userToken: req.user
        });
    });

});

/* ======================================
 Creando el metodo actualizar de los doctores
======================================*/
app.put('/:id', middlewareAuthentication.verifyToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    DoctorModel.findById(id, (err, doctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el doctor',
                error: err
            });
        } else if (!doctor) {
            return res.status(400).json({
                ok: false,
                message: `Error el doctor con el ${id} no existe`,
                error: {
                    message: `Error el doctor con el ${id} no existe`
                }
            });
        }

        doctor.name = body.name;
        doctor.user = req.user._id;
        doctor.hospital = body.hospital;

        doctor.save((err, doctorPut) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el doctor',
                    error: err
                });
            } else if (!doctorPut) {
                return res.status(400).json({
                    ok: false,
                    message: `Error el doctor con el ${id} no existe`,
                    error: {
                        message: `Error el doctor con el ${id} no existe`
                    }
                });
            }
            res.status(201).json({
                ok: true,
                body: doctorPut
            });
        });
    });
});

/* ======================================
 Creando el metodo para eliminar doctores
======================================*/

app.delete('/:id', middlewareAuthentication.verifyToken, (req, res) => {
    let id = req.params.id;

    DoctorModel.findByIdAndRemove(id, (err, doctorDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error no se pudo completar su solicitud',
                errors: err
            });
        }

        if (!doctorDelete) {
            return res.status(400).json({
                ok: false,
                message: `Error el doctor con el ${id} no existe`,
                errors: {
                    message: `Error el doctor con el ${id} no existe`
                }
            });
        }
        res.status(201).json({
            ok: true,
            body: doctorDelete
        });

    });
});

module.exports = app;