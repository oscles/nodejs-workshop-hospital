var express = require('express');
var fs = require('fs')
var middlewareAuthentication = require('../middlewares/authentication');

var UserModel = require('../models/user');
var HospitalModel = require('../models/hospital');
var DoctorModel = require('../models/doctor');

var fileUpload = require('express-fileupload');
var app = express();

// endpoint
app.use(fileUpload());
app.post('/:collection/:id', (req, res) => {
    let collection = req.params.collection;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No hay archivos cargados'
        });
    }

    let imageFile = req.files.img;
    let extension = req.files.img.name.split('.')[1];

    /* ======================================
     validando extensiones validas
    ======================================*/

    let extensionsValide = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionsValide.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Las extensiones validas son ' + extensionsValide
        });
    } else {

        /* ======================================
         Creando un nombre de archivo personalizado
        ======================================*/
        let fileName = `${id}-${new Date().getMilliseconds()}`;
        let collectionsValide = ['doctors', 'users', 'hospitals'];

        if (collectionsValide.indexOf(collection) < 0) {
            return res.status(400).json({
                ok: false,
                message: 'Las extensiones validas son ' + collectionsValide
            });
        }

        let path = `./media/${collection}/${fileName}.${extension}`;

        imageFile.mv(path).then(data => {
            loadImageByType(type, id, path, res);
        }).catch(err => {
            res.status(500).json({
                ok: false,
                err,
            });
        })


    }
});

function loadImageByType(type, id, nameFile, res) {
    let message = '';

    if (type === 'users') {
        UserModel.findById(id, (err, user) => {
            /* ======================================
             Elimina la imagen vieja guardada en el servidor
            ======================================*/
            let imgOld = `./media/users/${ user.img }`;
            if (fs.existsSync(imgOld)) {
                fs.unlink(imgOld);
            }

            user.img = nameFile;
            user.save((err, userUpdated) => {
                userUpdated.password = 'null';
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen del usuario cargada exitosamente.'
                });
            });
        });
    }
    if (type === 'hospitals') {
        message = 'La imagen del hospital ha sido actualizada';
        updateImage(HospitalModel, id, 'hospitals', nameFile, message, res);
    }
    if (type === 'doctors') {
        message = 'La imagen del doctor ha sido actualizada';
        updateImage(HospitalModel, id, 'doctors', nameFile, message, res);
    }
}

function updateImage(model, id, collection, nameFile, message, res) {
    model.findById(id, (err, data) => {
        if (!data) {
            return res.status(400).json({
                ok: false,
                message: 'No se encontraron resultados asociados a su busqueda',
            });
        }

        let imgOld = `./media/${ collection }/${ data.img }`;
        if (fs.existsSync(imgOld)) {
            fs.unlink(imgOld);
        }

        data.img = nameFile;
        data.save((err, dataUpdate) => {
            if (collection === 'users')
                dataUpdate.password = 'null';

            return res.status(200).json({
                ok: true,
                message,
                dataUpdate
            });
        });
    });
}
module.exports = app;