var express = require('express');
var app = express();

var HospitalModel = require('../models/hospital');
var DoctorModel = require('../models/doctor');
var UserModel = require('../models/user');

/* ======================================
 Mixin
======================================*/
let getSearchMixin = (query, model) => {
    return new Promise((resolve, reject) => {
        model.find(query, (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data)
        });
    });
}

/* ======================================
 Busqueda especifica
======================================*/
app.get('/collection/:table/:search', (req, res) => {
    let table = req.params.table;
    let search = req.params.search;
    let regex = new RegExp(search, 'i');

    let promise;

    switch (table) {
        case 'user':
            promise = getSearchMixin( 
                { $or: [{ name: regex }, { email: regex } ]}, UserModel
            );
            break;

        case 'hospital':
            promise = getSearchMixin({ name: regex }, HospitalModel);
            break;

        case 'doctor':
            promise = getSearchMixin({ name: regex }, DoctorModel);
            break;

        default:
            res.status(200).json({
                ok: true,
                results: {
                    ok:false,
                    message: 'No se encontraron resultados asociados a su busqueda'
                },
            });
        break;
    }

    promise.then(data => {
        res.status(200).json({
            ok: true,
            results: data,
        });
    });
});

/* ======================================
 Busqueda general
======================================*/
app.get('/all/:search', (req, res) => {
    let paramSearch = req.params.search;
    let regex = new RegExp(paramSearch, 'i');

    Promise.all(
        [
            getSearchMixin({ name: regex }, HospitalModel),
            getSearchMixin({ name: regex }, DoctorModel),
            getSearchMixin(
                {
                    $or: [
                        { name: regex },
                        { email: regex }
                    ]
                },
                UserModel
            )
        ]
    ).then(data => {
        res.status(200).json({
            ok: true,
            hospitals: data[0],
            doctors: data[1],
            users: data[2]
        });
    }).catch(error => {
        res.status(400).json({
            ok: false,
            message: error
        });
    });
});

module.exports = app;