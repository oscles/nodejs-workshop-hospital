const mongoose = require('mongoose');

/* ======================================
 Mejorando la forma como se muestran las validaciones
 de datos unicos
======================================*/
var uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let userSchema = new Schema({
    name: { 
        type: String, 
        required: [true, 'El nombre es requerido']
    },

    email: {
        type: String,
        unique: true, 
        required: [true, 'El email es requerido']
    },
   
    password: {
        type: String, 
        required: [true, 'La contraseña es requerido']
    },

    img: {
        type: String,
        required: false
    },
    
    google: {type:Boolean, required:true, default:false},

    role: {
        type: String,
        required: [true, 'El rol es requerido'],
        default: 'USER_ROLE',
        enum: {
            values: ['USER_ROLE', 'ADMIN_ROLE'],
            message: '{VALUE} no es un rol permitido'
        }
    },
});

userSchema.plugin(uniqueValidator, { message: 'El email {VALUE} ya existe!' });
module.exports = mongoose.model('User', userSchema);