const mongoose = require('mongoose');
var Schema = mongoose.Schema;


var doctorSchema = new Schema({
    name: { type: String, required:[true, 'Este campo es requerido']},
    img: { type: String, required: false },
    user: { 
        type:Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'Este campo es requerido']
    },
    hospital: { 
        type: Schema.Types.ObjectId, 
        ref: 'Hospital',
        required: [true, 'Este campo es requerido']
    }
});

module.exports = mongoose.model('Doctor', doctorSchema);