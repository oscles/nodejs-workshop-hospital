const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let hospitalSchema = Schema({
    name: { type: String, required:[true, 'Este campo es requerido']},
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Hospital', hospitalSchema);