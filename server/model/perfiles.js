const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  descripcion: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  }
});

const Perfil = mongoose.model('Perfil', resultSchema);

module.exports = Perfil;

